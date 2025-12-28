import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { userProfileSelector } from "@/prisma/selectors";

export const getUserProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	const { isAuthenticated, userId: clerkId } = await auth();

	if (!isAuthenticated) {
		throw redirect({ to: "/sign-in/$" });
	}

	const profile = await prisma.userProfile.findUnique({
		where: {
			clerkId,
			status: "APPROVED",
		},
		select: userProfileSelector,
	});

	if (!profile) {
		throw redirect({ to: "/sign-in/$" });
	}

	return { profile };
});

export const upsertUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			address: z.string("Address must be a string"),
			city: z.string("City must be a string"),
			postcode: z.string("Postcode must be a string"),
		}),
	)
	.handler(async ({ data }) => {
		const { isAuthenticated, userId: clerkId } = await auth();

		if (!isAuthenticated) {
			throw redirect({ to: "/sign-in/$" });
		}

		const profile = await prisma.userProfile.upsert({
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

		return { profile };
	});
