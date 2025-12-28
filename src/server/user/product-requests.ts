import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductRequestWhereInput } from "@/prisma/generated/models";
import { categorySelector, productRequestSelector } from "@/prisma/selectors";
import { getUserProfile } from "./profile";

export const getProductRequests = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			page: z.int("Page must be an integer").default(1),
			limit: z.int("Limit must be an integer").default(10),
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
			minQuantity: z.int("Minimum quantity must be an integer").optional(),
			minPrice: z
				.number("Minimum price must be a number")
				.transform((val) => val * 100)
				.optional(),
			maxPrice: z
				.number("Maximum price must be a number")
				.transform((val) => val * 100)
				.optional(),
			categoryId: z.uuid("Category id must be valid UUID").optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfile();

		const where: ProductRequestWhereInput = {
			isDeleted: false,
			category: { status: "APPROVED", isDeleted: false },
			userProfile: { id: profile.id },
			AND: [],
		};

		const eqFields = ["categoryId"] as const;

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

export const getProductRequestById = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			productRequestId: z.uuid("Product request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfile();

		const productRequest = await prisma.productRequest.findUnique({
			where: {
				id: data.productRequestId,
				isDeleted: false,
				category: { status: "APPROVED", isDeleted: false },
				userProfile: { id: profile.id },
			},
			select: {
				...productRequestSelector,
				category: { select: categorySelector },
			},
		});

		if (!productRequest) {
			throw notFound();
		}

		return { productRequest };
	});

export const createProductRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			pictureIds: z
				.array(z.string("Picture id must be a string"))
				.min(1, "At least one picture is required"),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be a string")
				.min(12, "Description must be at least 12 characters"),
			quantity: z
				.int("Quantity must be an integer")
				.min(1, "Quantity must be at least 1"),
			price: z
				.number("Price must be a number")
				.min(1, "Price must be at least 1")
				.transform((val) => val * 100),
			categoryId: z.uuid("Category id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfile();

		const category = await prisma.category.findUnique({
			where: {
				id: data.categoryId,
				status: "APPROVED",
				isDeleted: false,
			},
		});

		if (!category) {
			throw new Error("Category not found or not approved");
		}

		const productRequest = await prisma.productRequest.create({
			data: {
				...data,
				userProfileId: profile.id,
			},
			select: productRequestSelector,
		});

		return { productRequest };
	});
