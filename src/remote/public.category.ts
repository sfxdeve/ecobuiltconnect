import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { CategoryWhereInput } from "@/prisma/generated/models";
import { categorySelector } from "@/prisma/selectors";
import { RemoteError } from "@/remote/error";

export const getCategories = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
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
		try {
			const where: CategoryWhereInput = {
				status: "APPROVED",
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

			const categories = await prisma.category.findMany({
				where,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: categorySelector,
			});

			return {
				categories,
			};
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to fetch categories");
		}
	});
