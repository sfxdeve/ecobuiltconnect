import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UserProductsFiltersForm } from "@/components/forms/user-products-filter-form";
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
import { getProducts } from "@/lib/api/vendor.product";
import { cn } from "@/utils";
import { formatDate, formatMoneyFromCents } from "@/utils/formatters";

export const Route = createFileRoute("/(vendor)/vendor/products/")({
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
		minStock: z.int("Minimum stock must be an integer").optional(),
		minPrice: z.number("Minimum price must be a number").optional(),
		maxPrice: z.number("Maximum price must be a number").optional(),
		condition: z
			.enum(["EXCELLENT", "GOOD", "FAIR"], {
				message: "Condition must be either 'EXCELLENT', 'GOOD', or 'FAIR'",
			})
			.optional(),
		isVerified: z.boolean("Is verified must be a boolean").optional(),
		categoryId: z.uuid("Category id must be valid UUID").optional(),
		vendorProfileId: z.uuid("Vendor profile id must be valid UUID").optional(),
		productRequestId: z
			.uuid("Product request id must be valid UUID")
			.optional(),
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getProducts({ data: deps }),
	head: () => ({
		meta: [
			{
				title: "Products - EcobuiltConnect",
			},
			{
				name: "description",
				content: "Manage your product listings and inventory.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorProductsPage,
});

function VendorProductsPage() {
	const loaderData = Route.useLoaderData();

	return (
		<>
			<DashboardHeader title="Products" />
			<section className="p-4 space-y-6 min-h-screen">
				<ProductsPageSearch />
				{loaderData.products.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product Id</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Stock</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loaderData.products.map((product) => {
								return (
									<TableRow key={product.id}>
										<TableCell className="uppercase">
											{product.id.slice(24)}
										</TableCell>
										<TableCell>{product.name}</TableCell>
										<TableCell>{product.sku}</TableCell>
										<TableCell>{product.stock}</TableCell>
										<TableCell>
											{formatMoneyFromCents(
												product.salePrice ? product.salePrice : product.price,
												{
													locale: "en-ZA",
													currency: "ZAR",
												},
											)}
										</TableCell>
										<TableCell>{formatDate(product.createdAt)}</TableCell>
										<TableCell></TableCell>
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
				<ProductsPagePagination />
			</section>
		</>
	);
}

function ProductsPageSearch() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const [isProductsFiltersDialogOpen, setIsProductsFiltersDialogOpen] =
		useState(false);

	const areProductsFiltersActive =
		search.sortBy !== "createdAt" ||
		search.sortOrder !== "desc" ||
		search.minStock !== undefined ||
		search.minPrice !== undefined ||
		search.maxPrice !== undefined ||
		search.isVerified !== undefined;

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
			<Dialog
				open={isProductsFiltersDialogOpen}
				onOpenChange={setIsProductsFiltersDialogOpen}
			>
				<DialogTrigger
					render={
						<Button
							variant={areProductsFiltersActive ? "default" : "outline"}
						/>
					}
				>
					<FilterIcon />
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Filter Products
						</DialogTitle>
					</DialogHeader>
					<UserProductsFiltersForm
						defaultValues={{
							sortBy: search.sortBy,
							sortOrder: search.sortOrder,
							minStock: search.minStock,
							minPrice: search.minPrice,
							maxPrice: search.maxPrice,
							isVerified: search.isVerified,
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

							setIsProductsFiltersDialogOpen(false);
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

							setIsProductsFiltersDialogOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
			<Input
				placeholder="Search Products"
				defaultValue={Route.useSearch().searchTerm ?? ""}
				onChange={(event) => debouncedSearch(event.target.value)}
			/>
		</div>
	);
}

function ProductsPagePagination() {
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
					{loaderData.total} products
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
