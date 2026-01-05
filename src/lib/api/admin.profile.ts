import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { adminProfileSelector } from "@/prisma/selectors";
import { getClerkId } from "./shared.clerk";

export const getAdminProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	const { clerkId } = await getClerkId();

	const adminProfile = await prisma.adminProfile.findUnique({
		where: {
			clerkId,
			status: "APPROVED",
		},
		select: adminProfileSelector,
	});

	if (!adminProfile) {
		throw new Error("Admin profile not found");
	}

	return { adminProfile };
});

export const upsertAdminProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be a string")
				.min(10, "Description must be at least 10 characters"),
		}),
	)
	.handler(async ({ data }) => {
		const { clerkId } = await getClerkId();

		const adminProfile = await prisma.adminProfile.upsert({
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
			select: adminProfileSelector,
		});

		return { adminProfile };
	});
