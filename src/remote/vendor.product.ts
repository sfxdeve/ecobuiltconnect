import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { ProductCondition } from "@/prisma/generated/enums";
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
			minStock: z
				.int("Minimum stock must be an integer")
				.positive("Minimum stock must be a positive integer")
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
			condition: z
				.enum(
					[
						ProductCondition.EXCELLENT,
						ProductCondition.GOOD,
						ProductCondition.FAIR,
					],
					`Condition must be either '${ProductCondition.EXCELLENT}', '${ProductCondition.GOOD}', or '${ProductCondition.FAIR}'`,
				)
				.optional(),
			isVerified: z.boolean("Is verified must be a boolean").optional(),
			categoryId: z.uuid("Category id must be valid UUID").optional(),
			productRequestId: z
				.uuid("Product request id must be valid UUID")
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		try {
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
					OR: [
						{ salePrice: priceRange },
						{ salePrice: null, price: priceRange },
					],
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
						productRequestId: true,
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
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to fetch products");
		}
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
		try {
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
					productRequestId: true,
				},
			});

			if (!product) {
				throw new Error("Product not found");
			}

			return { product };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to fetch product");
		}
	});

export const createProduct = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			pictureKeys: z
				.array(z.string("Picture key must be a string"))
				.min(1, "At least one picture is required"),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be a string")
				.min(10, "Description must be at least 10 characters"),
			previousUsage: z
				.string("Previous usage must be a string")
				.min(10, "Previous usage must be at least 10 characters")
				.nullable(),
			sku: z
				.string("SKU must be a string")
				.min(3, "SKU must be at least 3 characters"),
			stock: z
				.int("Stock must be an integer")
				.positive("Stock must be a positive integer"),
			price: z
				.number("Price must be a number")
				.positive("Price must be a positive number")
				.transform((val) => val * 100),
			salePrice: z
				.number("Sale price must be a number")
				.positive("Sale price must be a positive number")
				.transform((val) => val * 100)
				.nullable(),
			condition: z.enum(
				[
					ProductCondition.EXCELLENT,
					ProductCondition.GOOD,
					ProductCondition.FAIR,
				],
				`Condition must be either '${ProductCondition.EXCELLENT}', '${ProductCondition.GOOD}', or '${ProductCondition.FAIR}'`,
			),
			categoryId: z.uuid("Category id must be valid UUID"),
			productRequestId: z
				.uuid("Product Request id must be valid UUID")
				.nullable(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { vendorProfile } = await getVendorProfile();

			const category = await prisma.category.findUnique({
				where: {
					id: data.categoryId,
					status: "APPROVED",
					isDeleted: false,
				},
			});

			if (!category) {
				throw new Error("Category not found");
			}

			const product = await prisma.product.create({
				data: {
					...data,
					vendorProfileId: vendorProfile.id,
				},
				select: productSelector,
			});

			return { product };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to create product");
		}
	});

export const updateProduct = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			productId: z.uuid("Product id must be valid UUID"),
			pictureKeys: z
				.array(z.string("Picture key must be a string"))
				.min(1, "At least one picture is required")
				.optional(),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters")
				.optional(),
			description: z
				.string("Description must be a string")
				.min(10, "Description must be at least 10 characters")
				.optional(),
			previousUsage: z
				.string("Previous usage must be a string")
				.min(10, "Previous usage must be at least 10 characters")
				.nullish(),
			sku: z
				.string("SKU must be a string")
				.min(3, "SKU must be at least 3 characters")
				.optional(),
			stock: z
				.int("Stock must be an integer")
				.positive("Stock must be a positive integer")
				.optional(),
			price: z
				.number("Price must be a number")
				.positive("Price must be a positive number")
				.transform((val) => val * 100)
				.optional(),
			salePrice: z
				.number("Sale price must be a number")
				.positive("Sale price must be a positive number")
				.transform((val) => val * 100)
				.nullish(),
			condition: z
				.enum(
					[
						ProductCondition.EXCELLENT,
						ProductCondition.GOOD,
						ProductCondition.FAIR,
					],
					`Condition must be either '${ProductCondition.EXCELLENT}', '${ProductCondition.GOOD}', or '${ProductCondition.FAIR}'`,
				)
				.optional(),
			categoryId: z.uuid("Category id must be valid UUID").optional(),
			productRequestId: z
				.uuid("Product Request id must be valid UUID")
				.nullish(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { vendorProfile } = await getVendorProfile();

			if (data.categoryId) {
				const category = await prisma.category.findUnique({
					where: {
						id: data.categoryId,
						status: "APPROVED",
						isDeleted: false,
					},
				});

				if (!category) {
					throw new Error("Category not found");
				}
			}

			const { productId, ...productData } = data;

			const product = await prisma.product.update({
				where: {
					id: productId,
					isDeleted: false,
					vendorProfile: { id: vendorProfile.id },
				},
				data: {
					...productData,
				},
				select: productSelector,
			});

			if (!product) {
				throw new Error("Product not found");
			}

			return { product };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to update product");
		}
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
		try {
			const { vendorProfile } = await getVendorProfile();

			const product = await prisma.product.update({
				where: {
					id: data.productId,
					isDeleted: false,
					vendorProfile: { id: vendorProfile.id },
				},
				data: {
					sku: randomUUID(),
					isDeleted: true,
				},
				select: productSelector,
			});

			if (!product) {
				throw new Error("Product not found");
			}

			return { product };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to delete product");
		}
	});
