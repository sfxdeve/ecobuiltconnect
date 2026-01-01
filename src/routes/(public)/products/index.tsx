import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { UserProductsFiltersForm } from "@/components/forms/user-products-filter-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
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
import { getProducts } from "@/lib/api/public.product";
import { ProductCondition } from "@/prisma/generated/enums";
import { cartActions } from "@/stores/cart";
import { cn } from "@/utils";
import { formatMoneyFromCents } from "@/utils/formatters";

export const Route = createFileRoute("/(public)/products/")({
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
		minStock: z
			.int("Minimum stock must be an integer")
			.positive("Minimum stock must be a positive integer")
			.optional(),
		minPrice: z
			.number("Minimum price must be a number")
			.positive("Minimum price must be a positive number")
			.optional(),
		maxPrice: z
			.number("Maximum price must be a number")
			.positive("Maximum price must be a positive number")
			.optional(),
		condition: z
			.enum(
				[
					ProductCondition.EXCELLENT,
					ProductCondition.GOOD,
					ProductCondition.FAIR,
				],
				`Condition must be either '${ProductCondition.EXCELLENT}', '${ProductCondition.GOOD}', or '${ProductCondition.FAIR}'`,
			)
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
				title: "Products",
			},
			{
				name: "description",
				content:
					"Browse our catalog of eco-friendly building materials and products. Sustainable sourcing for your construction needs.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: ProductsPage,
});

function ProductsPage() {
	const loaderData = Route.useLoaderData();

	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28 space-y-6">
				<ProductsPageSearch />
				{loaderData.products.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{loaderData.products.map((product) => (
							<Link
								key={product.id}
								to="/products/$productId"
								params={{ productId: product.id }}
							>
								<Card className="relative">
									{product.isVerified && (
										<Badge className="absolute top-4 right-4">
											EcobuiltConnect
										</Badge>
									)}
									<CardHeader>
										<img
											className="aspect-square object-contain"
											src={product.pictureIds[0]}
											alt={product.name}
										/>
									</CardHeader>
									<CardContent>
										<h3 className="font-semibold text-primary text-xs uppercase">
											{product.vendorProfile.name}
										</h3>
										<h2 className="font-semibold text-xl">{product.name}</h2>
									</CardContent>
									<CardFooter className="flex justify-between items-center">
										<div className="flex flex-col">
											<span className="font-bold text-xl">
												{formatMoneyFromCents(
													product.salePrice ? product.salePrice : product.price,
													{
														locale: "en-ZA",
														currency: "ZAR",
													},
												)}
											</span>
											<span className="text-xs">Excl. VAT</span>
										</div>
										<Button
											variant="default"
											size="lg"
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												cartActions.addItem({
													productId: product.id,
													quantity: 1,
												});
											}}
										>
											Purchase
										</Button>
									</CardFooter>
								</Card>
							</Link>
						))}
					</div>
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
			</div>
		</section>
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
						submitHandler={({ data }) => {
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
						resetHandler={({ data }) => {
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
