import { debounce } from "@tanstack/pacer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
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
import { formatDate, formatMoneyFromCents } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getOrderRequests } from "@/server/user/orders";

export const Route = createFileRoute("/user/orders/")({
	validateSearch: z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		searchTerm: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({
		search,
	}),
	loader: ({ deps: { search } }) =>
		getOrderRequests({
			data: {
				...search,
			},
		}),
	head: () => ({
		meta: [
			{
				title: "Orders - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: OrdersPage,
});

function OrdersPage() {
	const loaderData = Route.useLoaderData();

	return (
		<section className="container mx-auto py-12 px-4 space-y-6">
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
							let statusBadgeVariant: "default" | "outline" | "destructive" =
								"default";

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
									<TableCell>{orderRequest.orderItems.length}</TableCell>
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
							No results found for your search. Try adjusting your search terms.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			<OrdersPagePagination />
		</section>
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
			<InputGroup>
				<InputGroupInput
					placeholder="Search Orders"
					defaultValue={Route.useSearch().searchTerm ?? ""}
					onChange={(event) => debouncedSearch(event.target.value)}
				/>
				<InputGroupAddon align="inline-end" className="pr-1">
					<Button variant="default" size="sm">
						Search
					</Button>
				</InputGroupAddon>
			</InputGroup>
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
					<ChevronLeft />
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
					<ChevronRight />
				</Link>
			</div>
		</div>
	);
}
