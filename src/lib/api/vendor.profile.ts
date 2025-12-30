import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { vendorProfileSelector } from "@/prisma/selectors";
import { getClerkId } from "./shared.clerk";

export const getVendorProfile = createServerFn({
	method: "GET",
}).handler(async () => {
	const { clerkId } = await getClerkId();

	const vendorProfile = await prisma.vendorProfile.findUnique({
		where: {
			clerkId,
			status: "APPROVED",
		},
		select: vendorProfileSelector,
	});

	if (!vendorProfile) {
		throw new Error("Vendor profile not found");
	}

	return { vendorProfile };
});

export const upsertVendorProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			pictureId: z.string("Picture id must be a string"),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be a string")
				.min(10, "Description must be at least 10 characters"),
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

		const vendorProfile = await prisma.vendorProfile.upsert({
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
			select: vendorProfileSelector,
		});

		return { vendorProfile };
	});
