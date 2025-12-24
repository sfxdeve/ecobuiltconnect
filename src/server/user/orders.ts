import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { orderRequestSelector, productSelector } from "@/prisma/selectors";
import { getUserProfileServerFn } from "./profile";

export const getUserOrdersServerFn = createServerFn({
	method: "GET",
}).handler(async () => {});

export const createUserOrderServerFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			items: z
				.array(
					z.object({
						productId: z.uuid(),
						quantity: z.int().positive(),
					}),
				)
				.min(1, "Order must contain at least one item"),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfileServerFn();

		const quantityMapByProductId = new Map<string, number>();
		data.items.forEach((item) => {
			quantityMapByProductId.set(item.productId, item.quantity);
		});

		const productIds = data.items.map((item) => item.productId);

		const products = await prisma.product.findMany({
			where: {
				id: { in: productIds },
			},
			select: productSelector,
		});

		if (products.length !== productIds.length) {
			throw new Error("Some products could not be found");
		}

		const outOfStockItems: string[] = [];
		const insufficientStockItems: Array<{
			name: string;
			requested: number;
			available: number;
		}> = [];

		products.forEach((product) => {
			// biome-ignore lint/style/noNonNullAssertion: ik
			const requestedQty = quantityMapByProductId.get(product.id)!;

			if (product.stock === 0) {
				outOfStockItems.push(product.name);
			} else if (product.stock < requestedQty) {
				insufficientStockItems.push({
					name: product.name,
					requested: requestedQty,
					available: product.stock,
				});
			}
		});

		if (outOfStockItems.length > 0) {
			throw new Error(
				`The following items are out of stock: ${outOfStockItems.join(", ")}`,
			);
		}

		if (insufficientStockItems.length > 0) {
			const details = insufficientStockItems
				.map(
					(item) =>
						`${item.name} (requested: ${item.requested}, available: ${item.available})`,
				)
				.join(", ");
			throw new Error(`Insufficient stock for: ${details}`);
		}

		const total = products.reduce((acc, product) => {
			// biome-ignore lint/style/noNonNullAssertion: ik
			const quantity = quantityMapByProductId.get(product.id)!;
			return acc + (product.salePrice ?? product.price) * quantity;
		}, 0);

		const orderRequest = await prisma.$transaction(async (tx) => {
			const order = await tx.orderRequest.create({
				data: {
					userId: profile.id,
					total,
				},
				select: orderRequestSelector,
			});

			const items = products.map((product) => ({
				// biome-ignore lint/style/noNonNullAssertion: ik
				quantity: quantityMapByProductId.get(product.id)!,
				price: product.salePrice ?? product.price,
				orderId: order.id,
				productId: product.id,
			}));

			await tx.orderItem.createMany({
				data: items,
			});

			await Promise.all(
				products.map((product) =>
					tx.product.update({
						where: { id: product.id },
						data: {
							stock: {
								// biome-ignore lint/style/noNonNullAssertion: ik
								decrement: quantityMapByProductId.get(product.id)!,
							},
						},
					}),
				),
			);

			return order;
		});

		return { orderRequest };
	});
