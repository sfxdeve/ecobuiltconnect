import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { VendorProfileWhereInput } from "@/prisma/generated/models";
import { vendorProfileSelector } from "@/prisma/selectors";

export const getVendorProfiles = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
			sortOrder: z.enum(["asc", "desc"]).default("desc"),
			searchTerm: z.string().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const where: VendorProfileWhereInput = {
			status: "APPROVED",
			AND: [],
		};

		const searchFields = [
			"name",
			"description",
			"address",
			"city",
			"postalcode",
		] as const;

		if (data.searchTerm) {
			(where.AND as VendorProfileWhereInput[]).push({
				OR: searchFields.map((field) => ({
					[field]: { contains: data.searchTerm, mode: "insensitive" },
				})),
			});
		}

		const [vendorProfiles, total] = await Promise.all([
			prisma.vendorProfile.findMany({
				where,
				take: data.limit,
				skip: (data.page - 1) * data.limit,
				orderBy: { [data.sortBy]: data.sortOrder },
				select: vendorProfileSelector,
			}),
			prisma.vendorProfile.count({ where }),
		]);

		return {
			vendorProfiles,
			total,
			pages: Math.ceil(total / data.limit),
			limit: data.limit,
			page: data.page,
		};
	});
