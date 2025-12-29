import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getClerkId } from "@/lib/api/clerk";
import { prisma } from "@/prisma";
import { userProfileSelector } from "@/prisma/selectors";

export const getUserProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	const { clerkId } = await getClerkId();

	const userProfile = await prisma.userProfile.findUnique({
		where: {
			clerkId,
			status: "APPROVED",
		},
		select: userProfileSelector,
	});

	if (!userProfile) {
		throw new Error("User profile not found");
	}

	return { userProfile };
});

export const upsertUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			address: z
				.string("Address must be a string")
				.min(3, "Address must be at least 3 characters"),
			city: z
				.string("City must be a string")
				.min(3, "City must be at least 3 characters"),
			postcode: z
				.string("Postcode must be a string")
				.min(3, "Postcode must be at least 3 characters"),
		}),
	)
	.handler(async ({ data }) => {
		const { clerkId } = await getClerkId();

		const userProfile = await prisma.userProfile.upsert({
			where: {
				clerkId,
			},
			update: {
				address: data.address,
				city: data.city,
				postcode: data.postcode,
			},
			create: {
				clerkId,
				address: data.address,
				city: data.city,
				postcode: data.postcode,
			},
			select: userProfileSelector,
		});

		return { userProfile };
	});
