import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { ProductWhereInput } from "@/prisma/generated/models";
import {
	categorySelector,
	productSelector,
	vendorProfileSelector,
} from "@/prisma/selectors";

export const getPuclicProducts = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
			// product: z.object({}).optional(),
			// category: z.object({}).optional(),
			// vendor: z.object({}).optional(),
		}),
	)
	.handler(async ({ data: { page, limit, sortBy, sortOrder } }) => {
		const where = {
			isDeleted: false,
			category: {
				status: "APPROVED",
				isDeleted: false,
			},
			vendor: {
				status: "APPROVED",
			},
		} satisfies ProductWhereInput;

		const products = await prisma.product.findMany({
			where,
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			select: {
				...productSelector,
				category: { select: categorySelector },
				vendor: { select: vendorProfileSelector },
			},
		});

		const total = await prisma.product.count({ where });
		const pages = Math.ceil(total / limit);

		return {
			products,
			total,
			pages,
			limit,
			page,
		};
	});
