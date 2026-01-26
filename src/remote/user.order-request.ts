import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { OrderStatus } from "@/prisma/generated/enums";
import type {
	OrderRequestWhereInput,
	ProductWhereInput,
} from "@/prisma/generated/models";
import {
	logisticRequestSelector,
	orderItemSelector,
	orderRequestSelector,
	productSelector,
	reviewSelector,
} from "@/prisma/selectors";
import { RemoteError } from "@/remote/error";
import { getUserProfile } from "@/remote/user.profile";

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
			searchTerm: z.string("Search term must be a string").optional(),
			minTotal: z
				.number("Minimum total must be a number")
				.positive("Minimum total must be a positive number")
				.transform((val) => val * 100)
				.optional(),
			maxTotal: z
				.number("Maximum total must be a number")
				.positive("Maximum total must be a positive number")
				.transform((val) => val * 100)
				.optional(),
			status: z
				.enum(
					[OrderStatus.PROCESSING, OrderStatus.READY, OrderStatus.COMPLETED],
					`Status must be either '${OrderStatus.PROCESSING}', '${OrderStatus.READY}', or '${OrderStatus.COMPLETED}'`,
				)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { userProfile } = await getUserProfile();

			const where: OrderRequestWhereInput = {
				userProfileId: userProfile.id,
				orderItems: {
					some: {
						product: {
							AND: [],
						},
					},
				},
				AND: [],
			};

			const eqFields = ["status"] as const;

			eqFields.forEach((field) => {
				if (data[field] !== undefined) {
					where[field] = data[field];
				}
			});

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

			if (data.minTotal !== undefined || data.maxTotal !== undefined) {
				const priceRange = {
					gte: data.minTotal,
					lte: data.maxTotal,
				};

				(where.AND as OrderRequestWhereInput[]).push({
					total: priceRange,
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
						_count: {
							select: {
								orderItems: true,
							},
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
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to fetch order requests");
		}
	});

export const getOrderRequest = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			orderRequestId: z.uuid("Order request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { userProfile } = await getUserProfile();

			const orderRequest = await prisma.orderRequest.findUnique({
				where: {
					id: data.orderRequestId,
					userProfileId: userProfile.id,
				},
				select: {
					...orderRequestSelector,
					orderItems: {
						select: {
							...orderItemSelector,
							product: {
								select: productSelector,
							},
							review: {
								select: reviewSelector,
							},
						},
					},
					logisticRequest: {
						select: logisticRequestSelector,
					},
				},
			});

			if (!orderRequest) {
				throw new RemoteError("Order request not found");
			}

			return { orderRequest };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to fetch order request");
		}
	});

export const createOrderRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			items: z
				.array(
					z.object({
						quantity: z
							.int("Quantity must be an integer")
							.positive("Quantity must be a positive integer"),
						productId: z.uuid("Product id must be valid UUID"),
					}),
				)
				.min(1, "At least one item is required"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { userProfile } = await getUserProfile();

			const itemsMap = new Map<string, number>();

			for (const item of data.items) {
				itemsMap.set(item.productId, item.quantity);
			}

			const productIds = [...itemsMap.keys()];

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
				throw new RemoteError("Some products not found");
			}

			const stockIssues: {
				name: string;
				requested: number;
				available: number;
			}[] = [];

			for (const product of products) {
				// biome-ignore lint/style/noNonNullAssertion: Intentional
				const requested = itemsMap.get(product.id)!;

				if (product.stock < requested) {
					stockIssues.push({
						name: product.name,
						requested,
						available: product.stock,
					});
				}
			}

			if (stockIssues.length > 0) {
				throw new RemoteError(
					`Insufficient stock: ${stockIssues
						.map((i) => `${i.name} (${i.requested}/${i.available})`)
						.join(", ")}`,
				);
			}

			const totalPrice = products.reduce(
				(acc, product) =>
					acc +
					// biome-ignore lint/style/noNonNullAssertion: Intentional
					(product.salePrice ?? product.price) * itemsMap.get(product.id)!,
				0,
			);

			const { orderRequest } = await prisma.$transaction(async (tx) => {
				const orderRequest = await tx.orderRequest.create({
					data: {
						total: totalPrice,
						userProfileId: userProfile.id,
						orderItems: {
							createMany: {
								data: products.map((product) => ({
									// biome-ignore lint/style/noNonNullAssertion: Intentional
									quantity: itemsMap.get(product.id)!,
									price: product.salePrice ?? product.price,
									productId: product.id,
								})),
							},
						},
					},
					select: orderRequestSelector,
				});

				await Promise.all(
					products.map((product) =>
						tx.product.update({
							where: { id: product.id },
							data: {
								stock: {
									// biome-ignore lint/style/noNonNullAssertion: Intentional
									decrement: itemsMap.get(product.id)!,
								},
							},
						}),
					),
				);

				return { orderRequest };
			});

			return { orderRequest };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to create order request");
		}
	});
