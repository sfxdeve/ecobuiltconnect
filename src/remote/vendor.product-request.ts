import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductRequestWhereInput } from "@/prisma/generated/models";
import { categorySelector, productRequestSelector } from "@/prisma/selectors";
import { getVendorProfile } from "./vendor.profile";

export const getProductRequests = createServerFn({
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
			minQuantity: z
				.int("Minimum quantity must be an integer")
				.positive("Minimum quantity must be a positive integer")
				.optional(),
			minPrice: z
				.number("Minimum price must be a number")
				.positive("Minimum price must be a positive number")
				.transform((val) => val * 100)
				.optional(),
			maxPrice: z
				.number("Maximum price must be a number")
				.positive("Maximum price must be a positive number")
				.transform((val) => val * 100)
				.optional(),
			categoryId: z.uuid("Category id must be valid UUID").optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const where: ProductRequestWhereInput = {
			isDeleted: false,
			category: { status: "APPROVED", isDeleted: false },
			products: {
				none: {
					isDeleted: false,
					vendorProfile: {
						id: vendorProfile.id,
					},
				},
			},
			AND: [],
		};

		const eqFields = ["categoryId"] as const;

		eqFields.forEach((field) => {
			if (data[field] !== undefined) {
				where[field] = data[field];
			}
		});

		const searchFields = ["name", "description"] as const;

		if (data.searchTerm) {
			(where.AND as ProductRequestWhereInput[]).push({
				OR: searchFields.map((field) => ({
					[field]: { contains: data.searchTerm, mode: "insensitive" },
				})),
			});
		}

		if (data.minQuantity !== undefined) {
			where.quantity = { gte: data.minQuantity };
		}

		if (data.minPrice !== undefined || data.maxPrice !== undefined) {
			const priceRange = {
				gte: data.minPrice,
				lte: data.maxPrice,
			};

			where.price = priceRange;
		}

		const [productRequests, total] = await Promise.all([
			prisma.productRequest.findMany({
				where,
				take: data.limit,
				skip: (data.page - 1) * data.limit,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: {
					...productRequestSelector,
					category: { select: categorySelector },
				},
			}),
			prisma.productRequest.count({ where }),
		]);

		return {
			productRequests,
			total,
			pages: Math.ceil(total / data.limit),
			limit: data.limit,
			page: data.page,
		};
	});

export const getProductRequest = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			productRequestId: z.uuid("Product request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const productRequest = await prisma.productRequest.findUnique({
			where: {
				id: data.productRequestId,
				isDeleted: false,
				category: { status: "APPROVED", isDeleted: false },
				products: {
					none: {
						isDeleted: false,
						vendorProfile: {
							id: vendorProfile.id,
						},
					},
				},
			},
			select: {
				...productRequestSelector,
				category: { select: categorySelector },
			},
		});

		if (!productRequest) {
			throw new Error("Product not found");
		}

		return { productRequest };
	});
