import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { OrderStatus } from "@/prisma/generated/enums";
import type {
	OrderRequestWhereInput,
	ProductWhereInput,
} from "@/prisma/generated/models";
import {
	orderItemSelector,
	orderRequestSelector,
	productSelector,
	reviewSelector,
	userProfileSelector,
} from "@/prisma/selectors";
import { getAdminProfile } from "@/remote/admin.profile";
import { RemoteError } from "@/remote/error";

export const getOrderRequests = createServerFn({ method: "GET" })
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
			await getAdminProfile();

			const where: OrderRequestWhereInput = {
				status: {
					notIn: [OrderStatus.PENDING, OrderStatus.CANCELLED],
				},
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

export const getOrderRequest = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			orderRequestId: z.uuid("Order request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await getAdminProfile();

			const orderRequest = await prisma.orderRequest.findUnique({
				where: {
					id: data.orderRequestId,
					status: {
						notIn: [OrderStatus.PENDING, OrderStatus.CANCELLED],
					},
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
					userProfile: {
						select: userProfileSelector,
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
