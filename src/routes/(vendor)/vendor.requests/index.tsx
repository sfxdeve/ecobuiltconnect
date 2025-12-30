import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UserProductRequestsFiltersForm } from "@/components/forms/user-product-requests-filter-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { getProductRequests } from "@/lib/api/vendor.product-request";
import { cn } from "@/utils";
import { formatDate, formatMoneyFromCents } from "@/utils/formatters";

export const Route = createFileRoute("/(vendor)/vendor/requests/")({
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
		minQuantity: z
			.int("Minimum quantity must be an integer")
			.positive("Minimum quantity must be a positive integer")
			.optional(),
		minPrice: z
			.number("Minimum price must be a number")
			.positive("Minimum price must be a positive number")
			.optional(),
		maxPrice: z
			.number("Maximum price must be a number")
			.positive("Maximum price must be a positive number")
			.optional(),
		categoryId: z.uuid("Category id must be valid UUID").optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getProductRequests({ data: deps }),
	head: () => ({
		meta: [
			{
				title: "Requests - EcobuiltConnect",
			},
			{
				name: "description",
				content: "View and respond to customer product requests.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorRequestsPage,
});

function VendorRequestsPage() {
	const loaderData = Route.useLoaderData();

	return (
		<>
			<DashboardHeader title="Requests" />
			<section className="p-4 space-y-6 min-h-screen">
				<ProductRequestsPageSearch />
				{loaderData.productRequests.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loaderData.productRequests.map((productRequest) => {
								return (
									<TableRow key={productRequest.id}>
										<TableCell>{productRequest.name}</TableCell>
										<TableCell>{productRequest.category.name}</TableCell>
										<TableCell>{productRequest.quantity}</TableCell>
										<TableCell>
											{formatMoneyFromCents(productRequest.price, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</TableCell>
										<TableCell>
											{formatDate(productRequest.createdAt)}
										</TableCell>
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
				<ProductRequestsPagePagination />
			</section>
		</>
	);
}

function ProductRequestsPageSearch() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [
		isProductRequestsFiltersDialogOpen,
		setIsProductRequestsFiltersDialogOpen,
	] = useState(false);

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

	const areProductRequestsFiltersActive =
		search.sortBy !== "createdAt" ||
		search.sortOrder !== "desc" ||
		search.minQuantity !== undefined ||
		search.minPrice !== undefined ||
		search.maxPrice !== undefined;

	return (
		<div className="flex gap-2 items-center justify-between">
			<Dialog
				open={isProductRequestsFiltersDialogOpen}
				onOpenChange={setIsProductRequestsFiltersDialogOpen}
			>
				<DialogTrigger
					render={
						<Button
							variant={areProductRequestsFiltersActive ? "default" : "outline"}
						/>
					}
				>
					<FilterIcon />
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Filter Requests
						</DialogTitle>
					</DialogHeader>
					<UserProductRequestsFiltersForm
						defaultValues={{
							sortBy: search.sortBy,
							sortOrder: search.sortOrder,
							minQuantity: search.minQuantity,
							minPrice: search.minPrice,
							maxPrice: search.maxPrice,
						}}
						submitHandler={(data) => {
							navigate({
								search: (prev) => ({
									...prev,
									...data,
									page: 1,
								}),
								replace: true,
							});

							setIsProductRequestsFiltersDialogOpen(false);
						}}
						resetHandler={(data) => {
							navigate({
								search: (prev) => ({
									...prev,
									...data,
									page: 1,
								}),
								replace: true,
							});

							setIsProductRequestsFiltersDialogOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
			<Input
				placeholder="Search Requests"
				defaultValue={Route.useSearch().searchTerm ?? ""}
				onChange={(event) => debouncedSearch(event.target.value)}
			/>
		</div>
	);
}

function ProductRequestsPagePagination() {
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
					{loaderData.total} requests
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
