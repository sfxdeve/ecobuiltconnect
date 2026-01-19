import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductRequestWhereInput } from "@/prisma/generated/models";
import { categorySelector, productRequestSelector } from "@/prisma/selectors";
import { getUserProfile } from "@/remote/user.profile";

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
		try {
			const { userProfile } = await getUserProfile();

			const where: ProductRequestWhereInput = {
				isDeleted: false,
				userProfile: { id: userProfile.id },
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
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to fetch product requests");
		}
	});

export const createProductRequest = createServerFn({ method: "POST" })
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
			quantity: z
				.int("Quantity must be an integer")
				.positive("Quantity must be a positive integer"),
			price: z
				.number("Price must be a number")
				.positive("Price must be a positive number")
				.transform((val) => val * 100),
			categoryId: z.uuid("Category id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { userProfile } = await getUserProfile();

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

			const productRequest = await prisma.productRequest.create({
				data: {
					...data,
					userProfileId: userProfile.id,
				},
				select: productRequestSelector,
			});

			return { productRequest };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to create product request");
		}
	});
