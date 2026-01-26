import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { adminProfileSelector } from "@/prisma/selectors";
import { RemoteError } from "@/remote/error";
import { getClerkId } from "@/remote/shared.clerk";

export const getAdminProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		const { clerkId } = await getClerkId();

		const adminProfile = await prisma.adminProfile.findUnique({
			where: {
				clerkId,
				status: "APPROVED",
			},
			select: adminProfileSelector,
		});

		if (!adminProfile) {
			throw new RemoteError("Admin profile not found");
		}

		return { adminProfile };
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		if (error instanceof RemoteError) {
			throw error;
		}

		throw new Error("Failed to fetch admin profile");
	}
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
		try {
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
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to upsert admin profile");
		}
	});
