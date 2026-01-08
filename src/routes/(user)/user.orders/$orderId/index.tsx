import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarIcon, ExternalLinkIcon, PackageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppPending } from "@/components/blocks/app-pending";
import { UserLogisticRequestForm } from "@/components/forms/user-logistic-request-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { composeS3URL } from "@/lib/s3.shared";
import { cn } from "@/lib/utils";
import { createLogisticRequest } from "@/remote/user.logistic-request";
import { getOrderRequest } from "@/remote/user.order-request";

export const Route = createFileRoute("/(user)/user/orders/$orderId/")({
	loader: ({ params }) =>
		getOrderRequest({
			data: {
				orderRequestId: params.orderId,
			},
		}),
	head: () => ({
		meta: [
			{
				title: "Order Details",
			},
			{
				name: "description",
				content: "View your order details and status",
			},
		],
	}),
	component: OrderDetailsPage,
	pendingComponent: AppPending,
});

function OrderDetailsPage() {
	const loaderData = Route.useLoaderData();

	const router = useRouter();

	const [isLogisticRequestDialogOpen, setIsLogisticRequestDialogOpen] =
		useState(false);

	const createLogisticRequestFn = useServerFn(createLogisticRequest);

	const createLogisticRequestMutation = useMutation({
		mutationFn: createLogisticRequestFn,
		onSuccess: async () => {
			setIsLogisticRequestDialogOpen(false);

			router.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	let orderStatusBadgeVariant: "default" | "outline" | "destructive";
	let deliveryStatusBadgeVariant: "default" | "outline" | "destructive";

	switch (loaderData.orderRequest.status) {
		case "PAID":
		case "COMPLETED":
			orderStatusBadgeVariant = "default";
			break;
		case "CANCELLED":
			orderStatusBadgeVariant = "destructive";
			break;
		default:
			orderStatusBadgeVariant = "outline";
			break;
	}

	switch (loaderData.orderRequest.logisticRequest?.status) {
		case "PAID":
		case "DELIVERED":
			deliveryStatusBadgeVariant = "default";
			break;
		case "CANCELLED":
			deliveryStatusBadgeVariant = "destructive";
			break;
		default:
			deliveryStatusBadgeVariant = "outline";
			break;
	}

	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28 flex flex-col-reverse md:flex-row gap-6 items-start">
				<Card className="flex-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PackageIcon className="h-5 w-5" />
							Order Items
						</CardTitle>
						<CardDescription>
							{loaderData.orderRequest.orderItems.length} item
							{loaderData.orderRequest.orderItems.length !== 1 ? "s" : ""} in
							this order
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
									{loaderData.orderRequest.orderItems.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<div className="flex gap-3 items-center">
													<img
														src={composeS3URL(item.product.pictureKeys[0])}
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
							{loaderData.orderRequest.orderItems.map((item) => (
								<div key={item.id} className="border rounded-lg p-4 space-y-3">
									<div className="flex gap-3">
										<img
											src={composeS3URL(item.product.pictureKeys[0])}
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
							<CalendarIcon className="h-5 w-5" />
							Order Info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-1">
							<p className="text-sm font-medium">Order Ref</p>
							<p className="text-sm text-muted-foreground break-all">
								{loaderData.orderRequest.id.slice(24)}
							</p>
						</div>
						<Separator />
						<div className="space-y-1">
							<p className="text-sm font-medium">Order Date</p>
							<p className="text-sm text-muted-foreground">
								{formatDate(loaderData.orderRequest.createdAt)}
							</p>
						</div>
						<Separator />
						<div className="space-y-1">
							<p className="text-sm font-medium">Order Status</p>
							<Badge variant={orderStatusBadgeVariant}>
								{loaderData.orderRequest.status}
							</Badge>
						</div>
						<Separator />
						<div className="space-y-1">
							<p className="text-sm font-medium">Delivery Status</p>
							{loaderData.orderRequest.logisticRequest ? (
								<div className="flex gap-1 items-center">
									<Badge variant={deliveryStatusBadgeVariant}>
										{loaderData.orderRequest.logisticRequest.status}
									</Badge>
									<Link
										to="/user/orders/$orderId/delivery"
										params={{ orderId: loaderData.orderRequest.id }}
										className={cn(
											buttonVariants({
												variant: "ghost",
												size: "icon-xs",
											}),
										)}
									>
										<ExternalLinkIcon />
									</Link>
								</div>
							) : loaderData.orderRequest.status === "COMPLETED" ? (
								<Dialog
									open={isLogisticRequestDialogOpen}
									onOpenChange={setIsLogisticRequestDialogOpen}
								>
									<DialogTrigger
										render={<Button variant="outline" size="xs" />}
									>
										Request
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle className="text-xl font-semibold">
												Request Logistic
											</DialogTitle>
										</DialogHeader>
										<UserLogisticRequestForm
											defaultValues={{
												requestedPrice: 0,
											}}
											isSubmitting={createLogisticRequestMutation.isPending}
											submitHandler={({ data }) => {
												createLogisticRequestMutation.mutate({
													data: {
														...data,
														orderRequestId: loaderData.orderRequest.id,
													},
												});
											}}
										/>
									</DialogContent>
								</Dialog>
							) : (
								<p className="text-sm text-muted-foreground">N/A</p>
							)}
						</div>
						<Separator />
						<div className="space-y-1">
							<p className="text-sm font-medium">Total Price</p>
							<p className="text-lg font-semibold">
								{formatMoneyFromCents(loaderData.orderRequest.total, {
									locale: "en-ZA",
									currency: "ZAR",
								})}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
