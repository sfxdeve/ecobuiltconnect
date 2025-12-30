import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUserProfile } from "@/lib/api/user.profile";
import { prisma } from "@/prisma";
import type {
	OrderRequestWhereInput,
	ProductWhereInput,
} from "@/prisma/generated/models";
import {
	orderItemSelector,
	orderRequestSelector,
	productSelector,
} from "@/prisma/selectors";

export const getOrderRequests = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
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
			searchTerm: z.string("Search term must be a string").nullable(),
		}),
	)
	.handler(async ({ data }) => {
		const { userProfile } = await getUserProfile();

		const where: OrderRequestWhereInput = {
			userProfile: { id: userProfile.id },
			orderItems: {
				some: {
					product: {
						AND: [],
					},
				},
			},
		};

		const searchFields = [
			"name",
			"description",
			"previousUsage",
			"sku",
		] as const;

		if (data.searchTerm) {
			(where.orderItems?.some?.product?.AND as ProductWhereInput[])?.push({
				OR: searchFields.map((field) => ({
					[field]: { contains: data.searchTerm, mode: "insensitive" },
				})),
			});
		}

		const [orderRequests, total] = await Promise.all([
			prisma.orderRequest.findMany({
				where,
				take: data.limit,
				skip: (data.page - 1) * data.limit,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: {
					...orderRequestSelector,
					orderItems: {
						select: orderItemSelector,
					},
				},
			}),
			prisma.orderRequest.count({ where }),
		]);

		return {
			orderRequests,
			total,
			pages: Math.ceil(total / data.limit),
			limit: data.limit,
			page: data.page,
		};
	});

export const createOrderRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			items: z
				.array(
					z.object({
						productId: z.uuid("Product id must be valid UUID"),
						quantity: z
							.int("Quantity must be an integer")
							.positive("Quantity must be a positive integer"),
					}),
				)
				.min(1, "Order must contain at least one item"),
		}),
	)
	.handler(async ({ data }) => {
		const { userProfile } = await getUserProfile();

		const quantityMapByProductId = new Map<string, number>();

		data.items.forEach((item) => {
			quantityMapByProductId.set(item.productId, item.quantity);
		});

		const productIds = data.items.map((item) => item.productId);

		const products = await prisma.product.findMany({
			where: {
				id: { in: productIds },
				isDeleted: false,
				category: { status: "APPROVED", isDeleted: false },
				vendorProfile: { status: "APPROVED" },
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

		const { orderRequest } = await prisma.$transaction(async (tx) => {
			const orderRequest = await tx.orderRequest.create({
				data: {
					total,
					userProfileId: userProfile.id,
				},
				select: orderRequestSelector,
			});

			const items = products.map((product) => ({
				// biome-ignore lint/style/noNonNullAssertion: ik
				quantity: quantityMapByProductId.get(product.id)!,
				price: product.salePrice ?? product.price,
				orderRequestId: orderRequest.id,
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

			return { orderRequest };
		});

		return { orderRequest };
	});
