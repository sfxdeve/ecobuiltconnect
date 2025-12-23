import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/prisma";
import type { ProductWhereInput } from "@/prisma/generated/models";
import {
	categorySelector,
	productSelector,
	vendorProfileSelector,
} from "@/prisma/selectors";

export const getPuclicProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		const page = 1;
		const limit = 10;

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
			// orderBy: {},
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
	},
);
