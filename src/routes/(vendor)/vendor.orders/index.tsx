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
import {
	VendorOrderRequestForm,
	type vendorOrderRequestFormSchema,
} from "@/components/forms/vendor-order-request-form";
import { Badge } from "@/components/ui/badge";
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
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
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
	getOrderRequest,
	getOrderRequests,
	updateOrderRequest,
} from "@/lib/api/vendor.order-request";
import { cn } from "@/utils";
import { formatDate, formatMoneyFromCents } from "@/utils/formatters";

export const Route = createFileRoute("/(vendor)/vendor/orders/")({
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
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getOrderRequests({ data: deps }),
	head: () => ({
		meta: [
			{
				title: "Orders - EcobuiltConnect",
			},
			{
				name: "description",
				content: "Manage your vendor orders and shipments.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorOrdersPage,
});

function VendorOrdersPage() {
	const loaderData = Route.useLoaderData();

	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

	return (
		<>
			<DashboardHeader title="Orders" />
			<section className="p-4 space-y-6 min-h-screen">
				<OrdersPageSearch />
				{loaderData.orderRequests.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order Id</TableHead>
								<TableHead>Items</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loaderData.orderRequests.map((orderRequest) => {
								let statusBadgeVariant: "default" | "outline" | "destructive";

								switch (orderRequest.status) {
									case "PAID":
									case "COMPLETED":
										statusBadgeVariant = "default";
										break;
									case "CANCELLED":
										statusBadgeVariant = "destructive";
										break;
									default:
										statusBadgeVariant = "outline";
										break;
								}

								return (
									<TableRow key={orderRequest.id}>
										<TableCell className="uppercase">
											{orderRequest.id.slice(24)}
										</TableCell>
										<TableCell>{orderRequest._count.orderItems}</TableCell>
										<TableCell>
											<Badge variant={statusBadgeVariant}>
												{orderRequest.status}
											</Badge>
										</TableCell>
										<TableCell>
											{formatMoneyFromCents(orderRequest.total, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</TableCell>
										<TableCell>{formatDate(orderRequest.createdAt)}</TableCell>
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
															setIsViewDialogOpen(true);
														}}
													>
														View
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setIsUpdateDialogOpen(true);
														}}
													>
														Update
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											<Dialog
												open={isViewDialogOpen}
												onOpenChange={setIsViewDialogOpen}
											>
												<ViewOrderDialogContent
													orderRequestId={orderRequest.id}
												/>
											</Dialog>
											<Dialog
												open={isUpdateDialogOpen}
												onOpenChange={setIsUpdateDialogOpen}
											>
												<UpdateOrderDialogContent
													orderRequestId={orderRequest.id}
													setIsDialogOpen={setIsUpdateDialogOpen}
												/>
											</Dialog>
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
				<OrdersPagePagination />
			</section>
		</>
	);
}

function ViewOrderDialogContent({
	orderRequestId,
}: {
	orderRequestId: string;
}) {
	const getOrderRequestFn = useServerFn(getOrderRequest);

	const orderRequestResult = useQuery({
		queryKey: ["order-request", orderRequestId],
		queryFn: () => getOrderRequestFn({ data: { orderRequestId } }),
	});

	if (orderRequestResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>View Order</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading order details...
				</div>
			</DialogContent>
		);
	}

	if (orderRequestResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>View Order</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Error loading order: {orderRequestResult.error.message}
				</div>
			</DialogContent>
		);
	}

	const { orderRequest } = orderRequestResult.data;

	let statusBadgeVariant: "default" | "outline" | "destructive";
	switch (orderRequest.status) {
		case "PAID":
		case "COMPLETED":
			statusBadgeVariant = "default";
			break;
		case "CANCELLED":
			statusBadgeVariant = "destructive";
			break;
		default:
			statusBadgeVariant = "outline";
			break;
	}

	return (
		<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Order Details</DialogTitle>
			</DialogHeader>
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Order ID
							</ItemDescription>
							<ItemTitle className="font-medium uppercase">
								{orderRequest.id.slice(24)}
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Status
							</ItemDescription>
							<ItemTitle>
								<Badge variant={statusBadgeVariant}>
									{orderRequest.status}
								</Badge>
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Date
							</ItemDescription>
							<ItemTitle className="font-medium">
								{formatDate(orderRequest.createdAt)}
							</ItemTitle>
						</ItemContent>
					</Item>
					<Item variant="muted">
						<ItemContent>
							<ItemDescription className="text-sm text-muted-foreground">
								Total
							</ItemDescription>
							<ItemTitle className="font-medium">
								{formatMoneyFromCents(orderRequest.total, {
									locale: "en-ZA",
									currency: "ZAR",
								})}
							</ItemTitle>
						</ItemContent>
					</Item>
				</div>
				<div className="space-y-4">
					{orderRequest.orderItems.map((item) => (
						<Item key={item.id} variant="muted" className="flex gap-3">
							<ItemMedia variant="image" className="size-20">
								<img src={item.product.pictureIds[0]} alt={item.product.name} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle className="font-bold text-base">
									{item.product.name}
								</ItemTitle>
								<ItemDescription>
									<span>Qty: {item.quantity}</span>
									<br />
									<span>
										{formatMoneyFromCents(item.price * item.quantity, {
											locale: "en-ZA",
											currency: "ZAR",
										})}
									</span>
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</div>
			</div>
		</DialogContent>
	);
}

function UpdateOrderDialogContent({
	orderRequestId,
	setIsDialogOpen,
}: {
	orderRequestId: string;
	setIsDialogOpen: (open: boolean) => void;
}) {
	const router = useRouter();

	const getOrderRequestFn = useServerFn(getOrderRequest);
	const updateOrderRequestFn = useServerFn(updateOrderRequest);

	const orderRequestResult = useQuery({
		queryKey: ["order-request", orderRequestId],
		queryFn: () => getOrderRequestFn({ data: { orderRequestId } }),
	});

	const updateOrderRequestMutation = useMutation({
		mutationFn: updateOrderRequestFn,
		onSuccess: () => {
			toast.success("Order updated successfully");

			router.invalidate();

			setIsDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Update Order</DialogTitle>
			</DialogHeader>
			<VendorOrderRequestForm
				defaultValues={{
					orderRequestId,
					status: orderRequestResult.data?.orderRequest.status as z.infer<
						typeof vendorOrderRequestFormSchema
					>["status"],
				}}
				isSubmitting={updateOrderRequestMutation.isPending}
				submitHandler={updateOrderRequestMutation.mutate}
			/>
		</DialogContent>
	);
}

function OrdersPageSearch() {
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
				placeholder="Search Orders"
				defaultValue={Route.useSearch().searchTerm ?? ""}
				onChange={(event) => debouncedSearch(event.target.value)}
			/>
		</div>
	);
}

function OrdersPagePagination() {
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
					{loaderData.total} orders
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
