import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import type { UserProfileWhereInput } from "@/prisma/generated/models";
import { userProfileSelector } from "@/prisma/selectors";
import { RemoteError } from "@/remote/error";
import { getVendorProfile } from "@/remote/vendor.profile";

export const getUserProfiles = createServerFn({
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
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { vendorProfile } = await getVendorProfile();

			const where: UserProfileWhereInput = {
				orderRequests: {
					some: {
						orderItems: {
							every: {
								product: {
									vendorProfileId: vendorProfile.id,
								},
							},
						},
					},
				},
				AND: [],
			};

			const searchFields = [
				"name",
				"description",
				"address",
				"city",
				"postcode",
			] as const;

			if (data.searchTerm) {
				(where.AND as UserProfileWhereInput[]).push({
					OR: searchFields.map((field) => ({
						[field]: { contains: data.searchTerm, mode: "insensitive" },
					})),
				});
			}

			const [userProfiles, total] = await Promise.all([
				prisma.userProfile.findMany({
					where,
					take: data.limit,
					skip: (data.page - 1) * data.limit,
					orderBy: { [data.sortBy]: data.sortOrder },
					select: userProfileSelector,
				}),
				prisma.userProfile.count({ where }),
			]);

			return {
				userProfiles,
				total,
				pages: Math.ceil(total / data.limit),
				limit: data.limit,
				page: data.page,
			};
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to fetch user profiles");
		}
	});
