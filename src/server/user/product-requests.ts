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
			page: z.number().default(1),
			limit: z.number().default(10),
			sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
			searchTerm: z.string().optional(),
			minQuantity: z.number().optional(),
			minPrice: z.number().optional(),
			maxPrice: z.number().optional(),
			categoryId: z.uuid().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const where: ProductRequestWhereInput = {
			isDeleted: false,
			category: { status: "APPROVED", isDeleted: false },
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
				gte: data.minPrice ? data.minPrice * 100 : undefined,
				lte: data.maxPrice ? data.maxPrice * 100 : undefined,
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

export const getProductRequestById = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			id: z.uuid(),
		}),
	)
	.handler(async ({ data }) => {
		const productRequest = await prisma.productRequest.findUnique({
			where: {
				id: data.id,
				isDeleted: false,
				category: { status: "APPROVED", isDeleted: false },
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

export const createProductRequest = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pictureIds: z
				.array(z.string("Picture Id must be string"))
				.min(1, "At least one picture is required"),
			name: z
				.string("Name must be string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be string")
				.min(12, "Description must be at least 12 characters"),
			quantity: z
				.number("Quantity must be number")
				.min(1, "Quantity must be at least 1"),
			price: z
				.number("Price must be number")
				.min(1, "Price must be at least 1"),
			categoryId: z.uuid("Category Id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfile();

		const productRequest = await prisma.productRequest.create({
			data: {
				...data,
				userProfileId: profile.id,
			},
		});

		return { productRequest };
	});
