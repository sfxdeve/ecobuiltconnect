import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { ProfileStatus } from "@/prisma/generated/enums";
import type { UserProfileWhereInput } from "@/prisma/generated/models";
import { userProfileSelector } from "@/prisma/selectors";
import { getAdminProfile } from "./admin.profile";

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
			status: z
				.enum(
					[
						ProfileStatus.PENDING,
						ProfileStatus.REJECTED,
						ProfileStatus.APPROVED,
					],
					`Status must be either '${ProfileStatus.PENDING}', '${ProfileStatus.REJECTED}', or '${ProfileStatus.APPROVED}'`,
				)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await getAdminProfile();

			const where: UserProfileWhereInput = {
				AND: [],
			};

			const eqFields = ["status"] as const;

			eqFields.forEach((field) => {
				if (data[field] !== undefined) {
					where[field] = data[field];
				}
			});

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

			throw new Error("Failed to fetch user profiles");
		}
	});

export const getUserProfile = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			userProfileId: z.uuid("User profile id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await getAdminProfile();

			const userProfile = await prisma.userProfile.findUnique({
				where: {
					id: data.userProfileId,
				},
				select: userProfileSelector,
			});

			if (!userProfile) {
				throw new Error("User profile not found");
			}

			return { userProfile };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to fetch user profile");
		}
	});

export const updateUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			userProfileId: z.uuid("User profile id must be valid UUID"),
			status: z
				.enum(
					[
						ProfileStatus.PENDING,
						ProfileStatus.REJECTED,
						ProfileStatus.APPROVED,
					],
					`Status must be either '${ProfileStatus.PENDING}', '${ProfileStatus.REJECTED}', or '${ProfileStatus.APPROVED}'`,
				)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await getAdminProfile();

			const { userProfileId, ...userProfileData } = data;

			const userProfile = await prisma.userProfile.update({
				where: {
					id: userProfileId,
				},
				data: userProfileData,
				select: userProfileSelector,
			});

			if (!userProfile) {
				throw new Error("User profile not found");
			}

			return { userProfile };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to update user profile");
		}
	});
