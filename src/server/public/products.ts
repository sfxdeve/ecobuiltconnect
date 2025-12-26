import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductWhereInput } from "@/prisma/generated/models";
import {
	categorySelector,
	productSelector,
	vendorProfileSelector,
} from "@/prisma/selectors";

export const getProducts = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
			searchTerm: z.string().optional(),
			minStock: z.number().optional(),
			minPrice: z.number().optional(),
			maxPrice: z.number().optional(),
			condition: z.enum(["EXCELLENT", "GOOD", "FAIR"]).optional(),
			isVerified: z.boolean().optional(),
			categoryId: z.uuid().optional(),
			vendorProfileId: z.uuid().optional(),
			productRequestId: z.uuid().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const where: ProductWhereInput = {
			isDeleted: false,
			category: { status: "APPROVED", isDeleted: false },
			vendorProfile: { status: "APPROVED" },
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
				gte: data.minPrice ? data.minPrice * 100 : undefined,
				lte: data.maxPrice ? data.maxPrice * 100 : undefined,
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

export const getProductById = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			id: z.uuid(),
		}),
	)
	.handler(async ({ data }) => {
		const product = await prisma.product.findUnique({
			where: {
				id: data.id,
				isDeleted: false,
				category: { status: "APPROVED", isDeleted: false },
				vendorProfile: { status: "APPROVED" },
			},
			select: {
				...productSelector,
				category: { select: categorySelector },
				vendorProfile: { select: vendorProfileSelector },
			},
		});

		if (!product) {
			throw notFound();
		}

		return { product };
	});
