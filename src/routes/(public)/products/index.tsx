import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { AppProductsFiltersForm } from "@/components/forms/app-products-filter-form";
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
import { formatMoneyFromCents } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getProducts } from "@/server/public/products";
import { cartActions } from "@/stores/cart";

export const Route = createFileRoute("/(public)/products/")({
	validateSearch: z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		searchTerm: z.string().optional(),
		minStock: z.number().optional(),
		minPrice: z.number().optional(),
		maxPrice: z.number().optional(),
		condition: z.enum(["EXCELLENT", "GOOD", "FAIR"]).optional(),
		isVerified: z.boolean().optional(),
		categoryId: z.uuid().optional(),
		vendorProfileId: z.uuid().optional(),
		productRequestId: z.uuid().optional(),
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
				content: "",
			},
		],
	}),
	component: ProductsPage,
});

function ProductsPage() {
	const loaderData = Route.useLoaderData();

	return (
		<section className="container mx-auto py-12 px-4 space-y-6">
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
							No results found for your search. Try adjusting your search terms.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			<ProductsPagePagination />
		</section>
	);
}

function ProductsPageSearch() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

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
					<AppProductsFiltersForm
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
