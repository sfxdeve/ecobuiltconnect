import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { userProfileSelector, vendorProfileSelector } from "@/prisma/selectors";
import { getClerkId } from "./clerk";

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
				pictureId: data.pictureId,
				name: data.name,
				description: data.description,
				address: data.address,
				city: data.city,
				postcode: data.postcode,
			},
			create: {
				clerkId,
				pictureId: data.pictureId,
				name: data.name,
				description: data.description,
				address: data.address,
				city: data.city,
				postcode: data.postcode,
			},
			select: vendorProfileSelector,
		});

		return { vendorProfile };
	});
