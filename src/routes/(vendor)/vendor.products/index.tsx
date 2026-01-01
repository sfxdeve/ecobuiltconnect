import { debounce } from "@tanstack/pacer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	FilterIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { UserProductsFiltersForm } from "@/components/forms/user-products-filter-form";
import { VendorProductForm } from "@/components/forms/vendor-product-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
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
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
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
	createProduct,
	deleteProduct,
	getProduct,
	getProducts,
	updateProduct,
} from "@/lib/api/vendor.product";
import { ProductCondition } from "@/prisma/generated/enums";
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
				content: "Manage your product listings and inventory.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorProductsPage,
});

function VendorProductsPage() {
	const loaderData = Route.useLoaderData();

	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);
	const [selectedAction, setSelectedAction] = useState<
		"view" | "update" | "delete" | null
	>(null);

	return (
		<>
			<DashboardHeader title="Products" />
			<section>
				<div className="p-4 space-y-6 min-h-screen">
					<ProductsPageSearch />
					{loaderData.products.length > 0 ? (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>SKU</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Stock</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Date</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loaderData.products.map((product) => {
										return (
											<TableRow key={product.id}>
												<TableCell>{product.name}</TableCell>
												<TableCell>{product.sku}</TableCell>
												<TableCell>{product.category.name}</TableCell>
												<TableCell>{product.stock}</TableCell>
												<TableCell>
													{formatMoneyFromCents(
														product.salePrice
															? product.salePrice
															: product.price,
														{
															locale: "en-ZA",
															currency: "ZAR",
														},
													)}
												</TableCell>
												<TableCell>{formatDate(product.createdAt)}</TableCell>
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
																	setSelectedProductId(product.id);
																	setSelectedAction("view");
																}}
															>
																View
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => {
																	setSelectedProductId(product.id);
																	setSelectedAction("update");
																}}
															>
																Update
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => {
																	setSelectedProductId(product.id);
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
										setSelectedProductId(null);
										setSelectedAction(null);
									}
								}}
							>
								{selectedProductId && selectedAction === "view" && (
									<ViewProductDialogContent productId={selectedProductId} />
								)}
								{selectedProductId && selectedAction === "update" && (
									<UpdateProductDialogContent
										productId={selectedProductId}
										closeDialog={() => {
											setSelectedProductId(null);
											setSelectedAction(null);
										}}
									/>
								)}
								{selectedProductId && selectedAction === "delete" && (
									<DeleteProductDialogContent
										productId={selectedProductId}
										closeDialog={() => {
											setSelectedProductId(null);
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
					<ProductsPagePagination />
				</div>
			</section>
		</>
	);
}

function ViewProductDialogContent({ productId }: { productId: string }) {
	const getProductFn = useServerFn(getProduct);

	const productResult = useQuery({
		queryKey: ["product", productId],
		queryFn: () => getProductFn({ data: { productId } }),
	});

	if (productResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>View Product</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading product details...
				</div>
			</DialogContent>
		);
	}

	if (productResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>View Product</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Error loading product: {productResult.error.message}
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Product Details</DialogTitle>
			</DialogHeader>
			<div className="space-y-6">
				{/* Image Carousel */}
				<Carousel className="w-full">
					<CarouselContent>
						{productResult.data.product.pictureIds.map((pictureId, index) => (
							<CarouselItem key={pictureId}>
								<img
									className="aspect-square object-contain w-full rounded-lg"
									src={pictureId}
									alt={`${productResult.data.product.name} - View ${index + 1}`}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="left-4" />
					<CarouselNext className="right-4" />
				</Carousel>
				<div className="space-y-4">
					<Item variant="muted">
						<ItemContent>
							<ItemTitle className="text-lg font-semibold">
								Description
							</ItemTitle>
							<ItemDescription className="text-muted-foreground leading-relaxed">
								{productResult.data.product.description}
							</ItemDescription>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemTitle className="text-lg font-semibold">
								Previous Usage
							</ItemTitle>
							<ItemDescription className="text-muted-foreground leading-relaxed">
								{productResult.data.product.previousUsage}
							</ItemDescription>
						</ItemContent>
					</Item>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								SKU
							</ItemDescription>
							<ItemTitle className="font-medium">
								{productResult.data.product.sku}
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Stock
							</ItemDescription>
							<ItemTitle className="font-medium text-green-600">
								{productResult.data.product.stock} in stock
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Category
							</ItemDescription>
							<ItemTitle className="font-medium">
								{productResult.data.product.category.name}
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Date
							</ItemDescription>
							<ItemTitle className="font-medium">
								{formatDate(productResult.data.product.createdAt)}
							</ItemTitle>
						</ItemContent>
					</Item>
				</div>
			</div>
		</DialogContent>
	);
}

function CreateProductDialogContent({
	closeDialog,
}: {
	closeDialog: () => void;
}) {
	const router = useRouter();

	const createProductFn = useServerFn(createProduct);

	const createProductMutation = useMutation({
		mutationFn: createProductFn,
		onSuccess: () => {
			toast.success("Product created successfully");

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
				<DialogTitle>Create Product</DialogTitle>
			</DialogHeader>
			<VendorProductForm
				defaultValues={{
					pictureIds: [""],
					name: "",
					description: "",
					previousUsage: null,
					sku: "",
					stock: 0,
					price: 0,
					salePrice: null,
					condition: "GOOD",
					categoryId: "",
					productRequestId: null,
				}}
				isSubmitting={createProductMutation.isPending}
				submitHandler={createProductMutation.mutate}
			/>
		</DialogContent>
	);
}

function UpdateProductDialogContent({
	productId,
	closeDialog,
}: {
	productId: string;
	closeDialog: () => void;
}) {
	const router = useRouter();

	const getProductFn = useServerFn(getProduct);
	const updateProductFn = useServerFn(updateProduct);

	const productResult = useQuery({
		queryKey: ["product", productId],
		queryFn: () => getProductFn({ data: { productId } }),
	});

	const updateProductMutation = useMutation({
		mutationFn: updateProductFn,
		onSuccess: () => {
			toast.success("Product updated successfully");

			router.invalidate();

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (productResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Product</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading product details...
				</div>
			</DialogContent>
		);
	}

	if (productResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Product</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Error loading product: {productResult.error.message}
				</div>
			</DialogContent>
		);
	}

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Update Product</DialogTitle>
			</DialogHeader>
			<VendorProductForm
				defaultValues={{
					pictureIds: productResult.data.product.pictureIds,
					name: productResult.data.product.name,
					description: productResult.data.product.description,
					previousUsage: productResult.data.product.previousUsage,
					sku: productResult.data.product.sku,
					stock: productResult.data.product.stock,
					price: productResult.data.product.price / 100,
					salePrice: productResult.data.product.salePrice
						? productResult.data.product.salePrice / 100
						: null,
					condition: productResult.data.product.condition,
					categoryId: productResult.data.product.category.id,
					productRequestId: productResult.data.product.productRequestId,
				}}
				isSubmitting={updateProductMutation.isPending}
				submitHandler={({ data }) =>
					updateProductMutation.mutate({ data: { ...data, productId } })
				}
			/>
		</DialogContent>
	);
}

function DeleteProductDialogContent({
	productId,
	closeDialog,
}: {
	productId: string;
	closeDialog: () => void;
}) {
	const router = useRouter();

	const deleteProductFn = useServerFn(deleteProduct);

	const deleteProductMutation = useMutation({
		mutationFn: deleteProductFn,
		onSuccess: () => {
			toast.success("Product deleted successfully");

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
				<DialogTitle>Delete Product</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete this product?
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button
					onClick={closeDialog}
					disabled={deleteProductMutation.isPending}
					variant="secondary"
				>
					Cancel
				</Button>
				<Button
					onClick={() => deleteProductMutation.mutate({ data: { productId } })}
					disabled={deleteProductMutation.isPending}
					variant="destructive"
				>
					{deleteProductMutation.isPending ? "Deleting..." : "Delete"}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

function ProductsPageSearch() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const [isProductsFiltersDialogOpen, setIsProductsFiltersDialogOpen] =
		useState(false);
	const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] =
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
							size="icon"
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
			<Dialog
				open={isCreateProductDialogOpen}
				onOpenChange={setIsCreateProductDialogOpen}
			>
				<DialogTrigger render={<Button variant="default" />}>New</DialogTrigger>
				<CreateProductDialogContent
					closeDialog={() => setIsCreateProductDialogOpen(false)}
				/>
			</Dialog>
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
