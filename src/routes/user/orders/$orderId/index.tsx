import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoneyFromCents } from "@/lib/formatters";
import { getOrderRequest } from "@/server/user/orders";

export const Route = createFileRoute("/user/orders/$orderId/")({
	loader: ({ params }) =>
		getOrderRequest({
			data: {
				orderRequestId: params.orderId,
			},
		}),
	head: () => ({
		meta: [
			{
				title: "Order Details - EcobuiltConnect",
			},
			{
				name: "description",
				content: "View your order details and status",
			},
		],
	}),
	component: OrderDetailsPage,
});

function OrderDetailsPage() {
	const { orderRequest } = Route.useLoaderData();

	let statusBadgeVariant: "default" | "outline" | "destructive" = "default";

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
		<section className="container mx-auto py-6 md:py-12 px-4 flex flex-col-reverse md:flex-row gap-6 items-start">
			<Card className="flex-1">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Order Items
					</CardTitle>
					<CardDescription>
						{orderRequest.orderItems.length} item
						{orderRequest.orderItems.length !== 1 ? "s" : ""} in this order
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead className="text-right">Price</TableHead>
									<TableHead className="text-right">Quantity</TableHead>
									<TableHead className="text-right">Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orderRequest.orderItems.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<div className="flex gap-3 items-center">
												<img
													src={item.product.pictureIds[0]}
													alt={item.product.name}
													className="size-16 object-cover rounded"
												/>
												<div className="space-y-1">
													<p className="font-medium">{item.product.name}</p>
													<p className="text-sm text-muted-foreground line-clamp-1">
														{item.product.description}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right">
											{formatMoneyFromCents(item.price, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</TableCell>
										<TableCell className="text-right">
											{item.quantity}
										</TableCell>
										<TableCell className="text-right font-medium">
											{formatMoneyFromCents(item.price * item.quantity, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<div className="md:hidden space-y-4">
						{orderRequest.orderItems.map((item) => (
							<div key={item.id} className="border rounded-lg p-4 space-y-3">
								<div className="flex gap-3">
									<img
										src={item.product.pictureIds[0]}
										alt={item.product.name}
										className="size-20 object-cover rounded shrink-0"
									/>
									<div className="min-w-0">
										<p className="font-medium">{item.product.name}</p>
										<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
											{item.product.description}
										</p>
									</div>
								</div>
								<Separator />
								<div className="grid grid-cols-3 gap-2 text-sm">
									<div>
										<p className="text-muted-foreground">Price</p>
										<p className="font-medium">
											{formatMoneyFromCents(item.price, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">Qty</p>
										<p className="font-medium">{item.quantity}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Total</p>
										<p className="font-semibold">
											{formatMoneyFromCents(item.price * item.quantity, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<Card className="w-full md:w-72">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Order Info
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<p className="text-sm font-medium">Order ID</p>
						<p className="text-sm text-muted-foreground break-all">
							{orderRequest.id}
						</p>
					</div>
					<Separator />
					<div className="space-y-1">
						<p className="text-sm font-medium">Order Date</p>
						<p className="text-sm text-muted-foreground">
							{formatDate(orderRequest.createdAt)}
						</p>
					</div>
					<Separator />
					<div className="space-y-1">
						<p className="text-sm font-medium">Order Status</p>
						<Badge variant={statusBadgeVariant}>{orderRequest.status}</Badge>
					</div>
					<Separator />
					<div className="space-y-1">
						<p className="text-sm font-medium">Delivery Status</p>
						{orderRequest.logisticRequest ? (
							<Badge variant={statusBadgeVariant}>
								{orderRequest.logisticRequest.status}
							</Badge>
						) : orderRequest.status === "COMPLETED" ? (
							<Button variant="outline" size="xs">
								Request Delivery
							</Button>
						) : (
							<p className="text-sm text-muted-foreground">N/A</p>
						)}
					</div>
					<Separator />
					<div className="space-y-1">
						<p className="text-sm font-medium">Total Price</p>
						<p className="text-lg font-semibold">
							{formatMoneyFromCents(orderRequest.total, {
								locale: "en-ZA",
								currency: "ZAR",
							})}
						</p>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
