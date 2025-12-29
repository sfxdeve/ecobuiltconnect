import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
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
import { getOrderRequests } from "@/lib/api/vendor.order-requests";
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
												<DialogContent>
													<DialogHeader>
														<DialogTitle>View Order</DialogTitle>
													</DialogHeader>
												</DialogContent>
											</Dialog>
											<Dialog
												open={isUpdateDialogOpen}
												onOpenChange={setIsUpdateDialogOpen}
											>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Update Order</DialogTitle>
													</DialogHeader>
													<DialogFooter>
														<Button
															variant="secondary"
															onClick={() => {
																setIsUpdateDialogOpen(false);
															}}
														>
															Cancel
														</Button>
														<Button
															variant="default"
															onClick={() => {
																setIsUpdateDialogOpen(false);
															}}
														>
															Update
														</Button>
													</DialogFooter>
												</DialogContent>
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
