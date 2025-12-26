import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/prisma";
import {
	orderItemSelector,
	orderRequestSelector,
	productRequestSelector,
} from "@/prisma/selectors";

export const Route = createFileRoute("/api/ozow/notify")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const formData = await request.formData();

				const data = Object.fromEntries(formData.entries());

				if (!data.TransactionReference || !data.Status) {
					return new Response("Invalid data", { status: 400 });
				}

				switch (data.Status.toString()) {
					case "Complete": {
						try {
							await prisma.orderRequest.update({
								where: { id: data.TransactionReference.toString() },
								data: { status: "PAID" },
							});
						} catch (_error) {
							return new Response("Failed to update order request", {
								status: 500,
							});
						}
						break;
					}
					case "Cancelled":
					case "Error":
					case "Abandoned":
					case "PendingInvestigation": {
						try {
							const orderRequest = await prisma.orderRequest.findUnique({
								where: {
									id: data.TransactionReference.toString(),
									status: "PENDING",
								},
								select: {
									...orderRequestSelector,
									orderItems: {
										select: {
											...orderItemSelector,
											product: {
												select: productRequestSelector,
											},
										},
									},
								},
							});

							if (!orderRequest) {
								return new Response("Order request not found", {
									status: 404,
								});
							}

							await prisma.$transaction(async (tx) => {
								await Promise.all(
									orderRequest.orderItems.map((item) =>
										tx.product.update({
											where: { id: item.product.id },
											data: {
												stock: {
													increment: item.quantity,
												},
											},
										}),
									),
								);

								await tx.orderRequest.update({
									where: { id: orderRequest.id },
									data: {
										status: "CANCELLED",
									},
								});
							});
						} catch (_error) {
							return new Response("Failed to update order request", {
								status: 500,
							});
						}
						break;
					}
					default:
						break;
				}

				return new Response("Success", { status: 200 });
			},
		},
	},
});
