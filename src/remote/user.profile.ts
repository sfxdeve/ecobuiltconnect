import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { userProfileSelector } from "@/prisma/selectors";
import { RemoteError } from "@/remote/error";
import { getClerkId } from "@/remote/shared.clerk";

export const getUserProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		const { clerkId } = await getClerkId();

		const userProfile = await prisma.userProfile.findUnique({
			where: {
				clerkId,
				status: "APPROVED",
			},
			select: userProfileSelector,
		});

		if (!userProfile) {
			throw new RemoteError("User profile not found");
		}

		return { userProfile };
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		if (error instanceof RemoteError) {
			throw error;
		}

		throw new Error("Failed to fetch user profile");
	}
});

export const upsertUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
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
		try {
			const { clerkId } = await getClerkId();

			const userProfile = await prisma.userProfile.upsert({
				where: {
					clerkId,
				},
				update: {
					...data,
				},
				create: {
					clerkId,
					...data,
				},
				select: userProfileSelector,
			});

			return { userProfile };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to upsert user profile");
		}
	});
