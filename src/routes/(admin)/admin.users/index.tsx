import { debounce } from "@tanstack/pacer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { AdminUserProfileForm } from "@/components/forms/admin-user-profile-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ProfileStatus } from "@/prisma/generated/enums";
import {
	getUserProfile,
	getUserProfiles,
	updateUserProfile,
} from "@/remote/admin.user-profile";

export const Route = createFileRoute("/(admin)/admin/users/")({
	validateSearch: z.object({
		page: z
			.int("Page must be an integer")
			.positive("Page must be a positive integer")
			.default(1),
		limit: z
			.int("Limit must be an integer")
			.positive("Limit must be a positive integer")
			.default(10),
		sortBy: z
			.enum(["name", "createdAt"], {
				message: "Sort by must be either 'name' or 'createdAt'",
			})
			.default("createdAt"),
		sortOrder: z
			.enum(["asc", "desc"], {
				message: "Sort order must be either 'asc' or 'desc'",
			})
			.default("desc"),
		searchTerm: z.string("Search term must be a string").optional(),
		status: z
			.enum(
				[ProfileStatus.PENDING, ProfileStatus.REJECTED, ProfileStatus.APPROVED],
				`Status must be either '${ProfileStatus.PENDING}', '${ProfileStatus.REJECTED}', or '${ProfileStatus.APPROVED}'`,
			)
			.optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getUserProfiles({ data: deps }),
	head: () => ({
		meta: [
			{
				title: "User Profiles",
			},
			{
				name: "description",
				content: "Browse and manage user profiles.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: UserProfilesPage,
});

function UserProfilesPage() {
	const loaderData = Route.useLoaderData();

	const [selectedUserProfileId, setSelectedUserProfileId] = useState<
		string | null
	>(null);
	const [selectedAction, setSelectedAction] = useState<"update" | null>(null);

	return (
		<>
			<DashboardHeader title="User Profiles" />
			<section>
				<div className="p-4 space-y-6 min-h-screen">
					<UserProfilesPageSearch />
					{loaderData.userProfiles.length > 0 ? (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loaderData.userProfiles.map((userProfile) => {
										return (
											<TableRow key={userProfile.id}>
												<TableCell>{userProfile.name}</TableCell>
												<TableCell>{userProfile.status}</TableCell>
												<TableCell>
													{formatDate(userProfile.createdAt)}
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger
															render={<Button variant="ghost" size="icon" />}
														>
															<MoreHorizontalIcon />
															<span className="sr-only">Open actions menu</span>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() => {
																	setSelectedUserProfileId(userProfile.id);
																	setSelectedAction("update");
																}}
															>
																Update
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							<Dialog
								open={selectedAction !== null}
								onOpenChange={(open) => {
									if (!open) {
										setSelectedUserProfileId(null);
										setSelectedAction(null);
									}
								}}
							>
								{selectedUserProfileId && selectedAction === "update" && (
									<UpdateUserProfileDialogContent
										userProfileId={selectedUserProfileId}
										closeDialog={() => {
											setSelectedUserProfileId(null);
											setSelectedAction(null);
										}}
									/>
								)}
							</Dialog>
						</>
					) : (
						<Empty className="bg-muted">
							<EmptyHeader>
								<EmptyTitle>No results found</EmptyTitle>
								<EmptyDescription>
									No results found for your search. Try adjusting your search
									terms.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
					<UserProfilesPagePagination />
				</div>
			</section>
		</>
	);
}

function UpdateUserProfileDialogContent({
	userProfileId,
	closeDialog,
}: {
	userProfileId: string;
	closeDialog: () => void;
}) {
	const router = useRouter();

	const getUserProfileFn = useServerFn(getUserProfile);
	const updateUserProfileFn = useServerFn(updateUserProfile);

	const userProfileResult = useQuery({
		queryKey: ["userProfile", userProfileId],
		queryFn: () => getUserProfileFn({ data: { userProfileId } }),
	});

	const updateUserProfileMutation = useMutation({
		mutationFn: updateUserProfileFn,
		onSuccess: () => {
			toast.success("User profile updated successfully");

			router.invalidate();

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (userProfileResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update User Profile</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading user profile details...
				</div>
			</DialogContent>
		);
	}

	if (userProfileResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update User Profile</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Error loading user profile: {userProfileResult.error.message}
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Update User Profile</DialogTitle>
			</DialogHeader>
			<AdminUserProfileForm
				defaultValues={{
					status: userProfileResult.data.userProfile.status,
				}}
				isSubmitting={updateUserProfileMutation.isPending}
				submitHandler={({ data }) =>
					updateUserProfileMutation.mutate({
						data: { ...data, userProfileId },
					})
				}
				className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
			/>
		</DialogContent>
	);
}

function UserProfilesPageSearch() {
	const navigate = Route.useNavigate();

	const debouncedSearch = debounce(
		(searchTerm: string) => {
			navigate({
				search: (prev) => ({
					...prev,
					page: 1,
					searchTerm: searchTerm.trim() ? searchTerm : undefined,
				}),
				replace: true,
			});
		},
		{ wait: 500 },
	);

	return (
		<div className="flex gap-2 items-center justify-between">
			<Input
				placeholder="Search User Profiles"
				defaultValue={Route.useSearch().searchTerm ?? ""}
				onChange={(event) => debouncedSearch(event.target.value)}
			/>
		</div>
	);
}

function UserProfilesPagePagination() {
	const loaderData = Route.useLoaderData();
	const navigate = Route.useNavigate();

	const limitSelectId = useId();

	const start = (loaderData.page - 1) * loaderData.limit + 1;
	const end = Math.min(loaderData.page * loaderData.limit, loaderData.total);

	const prevDisabled = loaderData.page <= 1;
	const nextDisabled = loaderData.page >= loaderData.pages;

	return (
		<div className="flex items-center justify-between gap-4">
			<Field orientation="horizontal" className="w-fit">
				<FieldLabel htmlFor={limitSelectId}>
					Showing {loaderData.total === 0 ? 0 : start}-{end} of{" "}
					{loaderData.total} users
				</FieldLabel>
				<Select
					key={loaderData.limit}
					defaultValue={String(loaderData.limit)}
					onValueChange={(value) =>
						navigate({
							search: (prev) => ({
								...prev,
								limit: Number(value),
								page: 1,
							}),
							replace: true,
						})
					}
				>
					<SelectTrigger className="w-20 hidden md:flex" id={limitSelectId}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent align="start">
						<SelectGroup>
							<SelectItem value="5">5</SelectItem>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="25">25</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Field>
			<div className="flex items-center gap-1">
				<Link
					from={Route.fullPath}
					search={(prev) =>
						prevDisabled ? prev : { ...prev, page: prev.page - 1 }
					}
					onClick={(event) => {
						if (prevDisabled) event.preventDefault();
					}}
					aria-disabled={prevDisabled}
					tabIndex={prevDisabled ? -1 : 0}
					className={cn(
						buttonVariants({ variant: "ghost" }),
						prevDisabled && "opacity-50 pointer-events-none",
					)}
				>
					<ChevronLeftIcon />
					<span>Previous</span>
				</Link>
				<Link
					from={Route.fullPath}
					search={(prev) =>
						nextDisabled ? prev : { ...prev, page: prev.page + 1 }
					}
					onClick={(event) => {
						if (nextDisabled) event.preventDefault();
					}}
					aria-disabled={nextDisabled}
					tabIndex={nextDisabled ? -1 : 0}
					className={cn(
						buttonVariants({ variant: "ghost" }),
						nextDisabled && "opacity-50 pointer-events-none",
					)}
				>
					<span>Next</span>
					<ChevronRightIcon />
				</Link>
			</div>
		</div>
	);
}
