import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { CategoryStatus } from "@/prisma/generated/enums";
import type { CategoryWhereInput } from "@/prisma/generated/models";
import { categorySelector } from "@/prisma/selectors";
import { getAdminProfile } from "./admin.profile";

export const getCategories = createServerFn({ method: "GET" })
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
			status: z
				.enum(
					[
						CategoryStatus.REQUESTED,
						CategoryStatus.REJECTED,
						CategoryStatus.APPROVED,
					],
					`Status must be either '${CategoryStatus.REQUESTED}', '${CategoryStatus.REJECTED}', or '${CategoryStatus.APPROVED}'`,
				)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		await getAdminProfile();

		const where: CategoryWhereInput = {
			isDeleted: true,
			AND: [],
		};

		const searchFields = ["name"] as const;

		if (data.searchTerm) {
			(where.AND as CategoryWhereInput[]).push({
				OR: searchFields.map((field) => ({
					[field]: { contains: data.searchTerm, mode: "insensitive" },
				})),
			});
		}

		const [categories, total] = await Promise.all([
			prisma.category.findMany({
				where,
				take: data.limit,
				skip: (data.page - 1) * data.limit,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: categorySelector,
			}),
			prisma.category.count({ where }),
		]);

		return {
			categories,
			total,
			pages: Math.ceil(total / data.limit),
			limit: data.limit,
			page: data.page,
		};
	});

export const getCategory = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			categoryId: z.uuid("Category id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const category = await prisma.category.findUnique({
			where: {
				id: data.categoryId,
				isDeleted: true,
			},
			select: categorySelector,
		});

		if (!category) {
			throw new Error("Category not found");
		}

		return { category };
	});

export const createCategory = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			status: z.enum(
				[
					CategoryStatus.REQUESTED,
					CategoryStatus.REJECTED,
					CategoryStatus.APPROVED,
				],
				`Status must be either '${CategoryStatus.REQUESTED}', '${CategoryStatus.REJECTED}', or '${CategoryStatus.APPROVED}'`,
			),
		}),
	)
	.handler(async ({ data }) => {
		const category = await prisma.category.create({
			data,
			select: categorySelector,
		});

		if (!category) {
			throw new Error("Category not found");
		}

		return { category };
	});

export const updateCategory = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			categoryId: z.uuid("Category id must be valid UUID"),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters")
				.optional(),
			status: z
				.enum(
					[
						CategoryStatus.REQUESTED,
						CategoryStatus.REJECTED,
						CategoryStatus.APPROVED,
					],
					`Status must be either '${CategoryStatus.REQUESTED}', '${CategoryStatus.REJECTED}', or '${CategoryStatus.APPROVED}'`,
				)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { categoryId, ...categoryData } = data;

		const category = await prisma.category.update({
			where: {
				id: categoryId,
				isDeleted: false,
			},
			data: categoryData,
			select: categorySelector,
		});

		if (!category) {
			throw new Error("Category not found");
		}

		return { category };
	});

export const deleteCategory = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			categoryId: z.uuid("Category id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const category = await prisma.category.update({
			where: {
				id: data.categoryId,
				isDeleted: false,
			},
			data: {
				isDeleted: true,
			},
			select: categorySelector,
		});

		if (!category) {
			throw new Error("Category not found");
		}

		return { category };
	});
