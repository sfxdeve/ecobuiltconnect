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
import { AdminCategoryForm } from "@/components/forms/admin-category-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import {
	createCategory,
	deleteCategory,
	getCategories,
	getCategory,
	updateCategory,
} from "@/lib/api/admin.categories";
import { CategoryStatus } from "@/prisma/generated/enums";
import { cn } from "@/utils";
import { formatDate } from "@/utils/formatters";

export const Route = createFileRoute("/(admin)/admin/categories/")({
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
				[
					CategoryStatus.REQUESTED,
					CategoryStatus.REJECTED,
					CategoryStatus.APPROVED,
				],
				`Status must be either '${CategoryStatus.REQUESTED}', '${CategoryStatus.REJECTED}', or '${CategoryStatus.APPROVED}'`,
			)
			.optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getCategories({ data: deps }),
	head: () => ({
		meta: [
			{
				title: "Categories",
			},
			{
				name: "description",
				content: "Manage your category listings and inventory.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: CategoriesPage,
});

function CategoriesPage() {
	const loaderData = Route.useLoaderData();

	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);
	const [selectedAction, setSelectedAction] = useState<
		"update" | "delete" | null
	>(null);

	return (
		<>
			<DashboardHeader title="Categories" />
			<section>
				<div className="p-4 space-y-6 min-h-screen">
					<CategoriesPageSearch />
					{loaderData.categories.length > 0 ? (
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
									{loaderData.categories.map((category) => {
										return (
											<TableRow key={category.id}>
												<TableCell>{category.name}</TableCell>
												<TableCell>{category.status}</TableCell>
												<TableCell>{formatDate(category.createdAt)}</TableCell>
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
																	setSelectedCategoryId(category.id);
																	setSelectedAction("update");
																}}
															>
																Update
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => {
																	setSelectedCategoryId(category.id);
																	setSelectedAction("delete");
																}}
															>
																Delete
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
										setSelectedCategoryId(null);
										setSelectedAction(null);
									}
								}}
							>
								{selectedCategoryId && selectedAction === "update" && (
									<UpdateCategoryDialogContent
										categoryId={selectedCategoryId}
										closeDialog={() => {
											setSelectedCategoryId(null);
											setSelectedAction(null);
										}}
									/>
								)}
								{selectedCategoryId && selectedAction === "delete" && (
									<DeleteCategoryDialogContent
										categoryId={selectedCategoryId}
										closeDialog={() => {
											setSelectedCategoryId(null);
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
					<CategoriesPagePagination />
				</div>
			</section>
		</>
	);
}

function CreateCategoryDialogContent({
	closeDialog,
}: {
	closeDialog: () => void;
}) {
	const router = useRouter();

	const createCategoryFn = useServerFn(createCategory);

	const createCategoryMutation = useMutation({
		mutationFn: createCategoryFn,
		onSuccess: () => {
			toast.success("Category created successfully");

			router.invalidate();

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create Category</DialogTitle>
			</DialogHeader>
			<AdminCategoryForm
				defaultValues={{
					name: "",
					status: CategoryStatus.APPROVED,
				}}
				isSubmitting={createCategoryMutation.isPending}
				submitHandler={createCategoryMutation.mutate}
				className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
			/>
		</DialogContent>
	);
}

function UpdateCategoryDialogContent({
	categoryId,
	closeDialog,
}: {
	categoryId: string;
	closeDialog: () => void;
}) {
	const router = useRouter();

	const getCategoryFn = useServerFn(getCategory);
	const updateCategoryFn = useServerFn(updateCategory);

	const categoryResult = useQuery({
		queryKey: ["category", categoryId],
		queryFn: () => getCategoryFn({ data: { categoryId } }),
	});

	const updateCategoryMutation = useMutation({
		mutationFn: updateCategoryFn,
		onSuccess: () => {
			toast.success("Category updated successfully");

			router.invalidate();

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (categoryResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Category</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading category details...
				</div>
			</DialogContent>
		);
	}

	if (categoryResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Category</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Error loading category: {categoryResult.error.message}
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Update Category</DialogTitle>
			</DialogHeader>
			<AdminCategoryForm
				defaultValues={{
					name: categoryResult.data.category.name,
					status: categoryResult.data.category.status,
				}}
				isSubmitting={updateCategoryMutation.isPending}
				submitHandler={({ data }) =>
					updateCategoryMutation.mutate({ data: { ...data, categoryId } })
				}
				className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
			/>
		</DialogContent>
	);
}

function DeleteCategoryDialogContent({
	categoryId,
	closeDialog,
}: {
	categoryId: string;
	closeDialog: () => void;
}) {
	const router = useRouter();

	const deleteCategoryFn = useServerFn(deleteCategory);

	const deleteCategoryMutation = useMutation({
		mutationFn: deleteCategoryFn,
		onSuccess: () => {
			toast.success("Category deleted successfully");

			router.invalidate();

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Delete Category</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete this category?
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button
					onClick={closeDialog}
					disabled={deleteCategoryMutation.isPending}
					variant="secondary"
				>
					Cancel
				</Button>
				<Button
					onClick={() =>
						deleteCategoryMutation.mutate({ data: { categoryId } })
					}
					disabled={deleteCategoryMutation.isPending}
					variant="destructive"
				>
					{deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

function CategoriesPageSearch() {
	const navigate = Route.useNavigate();

	const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
		useState(false);

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
				placeholder="Search Categories"
				defaultValue={Route.useSearch().searchTerm ?? ""}
				onChange={(event) => debouncedSearch(event.target.value)}
			/>
			<Dialog
				open={isCreateCategoryDialogOpen}
				onOpenChange={setIsCreateCategoryDialogOpen}
			>
				<DialogTrigger render={<Button variant="default" />}>New</DialogTrigger>
				<CreateCategoryDialogContent
					closeDialog={() => setIsCreateCategoryDialogOpen(false)}
				/>
			</Dialog>
		</div>
	);
}

function CategoriesPagePagination() {
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
