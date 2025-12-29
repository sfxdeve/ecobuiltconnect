import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type {
	OrderRequestWhereInput,
	ProductWhereInput,
} from "@/prisma/generated/models";
import { orderRequestSelector } from "@/prisma/selectors";
import { getVendorProfile } from "./vendor.profile";

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
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const where: OrderRequestWhereInput = {
			orderItems: {
				every: {
					product: {
						AND: [
							{
								vendorProfile: {
									id: vendorProfile.id,
								},
							},
						],
					},
				},
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
	});
