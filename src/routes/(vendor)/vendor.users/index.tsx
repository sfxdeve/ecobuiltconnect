import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { buttonVariants } from "@/components/ui/button";
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
import { getUserProfiles } from "@/remote/vendor.user-profile";

export const Route = createFileRoute("/(vendor)/vendor/users/")({
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
				content: "Manage your user profile listings and inventory.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: UserProfilesPage,
});

function UserProfilesPage() {
	const loaderData = Route.useLoaderData();

	return (
		<>
			<DashboardHeader title="User Profiles" />
			<section>
				<div className="p-4 space-y-6 min-h-screen">
					<UserProfilesPageSearch />
					{loaderData.userProfiles.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loaderData.userProfiles.map((userProfile) => {
									return (
										<TableRow key={userProfile.id}>
											<TableCell>{userProfile.name}</TableCell>
											<TableCell>{userProfile.status}</TableCell>
											<TableCell>{formatDate(userProfile.createdAt)}</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
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
				placeholder="Search UserProfiles"
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
					{loaderData.total} categories
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
