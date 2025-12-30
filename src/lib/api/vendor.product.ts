import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductWhereInput } from "@/prisma/generated/models";
import {
	categorySelector,
	productSelector,
	vendorProfileSelector,
} from "@/prisma/selectors";
import { getVendorProfile } from "./vendor.profile";

export const getProducts = createServerFn({
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
			minStock: z.int("Minimum stock must be an integer").optional(),
			minPrice: z
				.number("Minimum price must be a number")
				.transform((val) => val * 100)
				.optional(),
			maxPrice: z
				.number("Maximum price must be a number")
				.transform((val) => val * 100)
				.optional(),
			condition: z
				.enum(["EXCELLENT", "GOOD", "FAIR"], {
					message: "Condition must be either 'EXCELLENT', 'GOOD', or 'FAIR'",
				})
				.optional(),
			isVerified: z.boolean("Is verified must be a boolean").optional(),
			categoryId: z.uuid("Category id must be valid UUID").optional(),
			vendorProfileId: z
				.uuid("Vendor profile id must be valid UUID")
				.optional(),
			productRequestId: z
				.uuid("Product request id must be valid UUID")
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const where: ProductWhereInput = {
			isDeleted: false,
			vendorProfile: { id: vendorProfile.id },
			AND: [],
		};

		const eqFields = [
			"condition",
			"isVerified",
			"categoryId",
			"vendorProfileId",
			"productRequestId",
		] as const;

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
			(where.AND as ProductWhereInput[]).push({
				OR: searchFields.map((field) => ({
					[field]: { contains: data.searchTerm, mode: "insensitive" },
				})),
			});
		}

		if (data.minStock !== undefined) {
			where.stock = { gte: data.minStock };
		}

		if (data.minPrice !== undefined || data.maxPrice !== undefined) {
			const priceRange = {
				gte: data.minPrice,
				lte: data.maxPrice,
			};

			(where.AND as ProductWhereInput[]).push({
				OR: [{ salePrice: priceRange }, { salePrice: null, price: priceRange }],
			});
		}

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				take: data.limit,
				skip: (data.page - 1) * data.limit,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: {
					...productSelector,
					category: { select: categorySelector },
					vendorProfile: { select: vendorProfileSelector },
				},
			}),
			prisma.product.count({ where }),
		]);

		return {
			products,
			total,
			pages: Math.ceil(total / data.limit),
			limit: data.limit,
			page: data.page,
		};
	});

export const getProduct = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			productId: z.uuid("Product id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const product = await prisma.product.findUnique({
			where: {
				id: data.productId,
				isDeleted: false,
				vendorProfile: { id: vendorProfile.id },
			},
			select: {
				...productSelector,
				category: { select: categorySelector },
				vendorProfile: { select: vendorProfileSelector },
			},
		});

		if (!product) {
			throw new Error("Product not found");
		}

		return { product };
	});

export const deleteProduct = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			productId: z.uuid("Product id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { vendorProfile } = await getVendorProfile();

		const product = await prisma.product.update({
			where: {
				id: data.productId,
				isDeleted: false,
				vendorProfile: { id: vendorProfile.id },
			},
			data: {
				isDeleted: true,
			},
			select: productSelector,
		});

		if (!product) {
			throw new Error("Product not found");
		}

		return { product };
	});
