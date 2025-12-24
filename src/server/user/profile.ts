import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { userProfileSelector } from "@/prisma/selectors";

export const getUserProfileServerFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const { isAuthenticated, userId: clerkId } = await auth();

	if (!isAuthenticated) {
		throw redirect({ to: "/sign-in/$" });
	}

	const profile = await prisma.userProfile.findUnique({
		where: {
			clerkId,
		},
		select: userProfileSelector,
	});

	return { profile };
});

export const createUserProfileServerFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			address: z.string(),
			city: z.string(),
			postcode: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const { isAuthenticated, userId: clerkId } = await auth();

		if (!isAuthenticated) {
			throw redirect({ to: "/sign-in/$" });
		}

		const profile = await prisma.userProfile.create({
			data: {
				clerkId,
				address: data.address,
				city: data.city,
				postcode: data.postcode,
			},
			select: userProfileSelector,
		});

		return { profile };
	});
