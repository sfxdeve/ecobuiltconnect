import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/prisma";
import type {
	AdminProfile,
	LogisticProfile,
	UserProfile,
	VendorProfile,
} from "@/prisma/generated/client";
import {
	adminProfileSelector,
	logisticProfileSelector,
	userProfileSelector,
	vendorProfileSelector,
} from "@/prisma/selectors";
import { getClerkId } from "./shared.clerk";

export const getProfile = createServerFn({ method: "GET" }).handler(
	async () => {
		const { clerkId } = await getClerkId();

		let profile:
			| UserProfile
			| AdminProfile
			| VendorProfile
			| LogisticProfile
			| null = null;
		let role: "user" | "admin" | "vendor" | "logistic" | null = null;

		const userProfile = await prisma.userProfile.findUnique({
			where: {
				clerkId,
			},
			select: {
				...userProfileSelector,
				status: true,
			},
		});

		if (userProfile) {
			profile = userProfile;
			role = "user";
		}

		const adminProfile = await prisma.adminProfile.findUnique({
			where: {
				clerkId,
			},
			select: {
				...adminProfileSelector,
				status: true,
			},
		});

		if (adminProfile) {
			profile = adminProfile;
			role = "admin";
		}

		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: {
				clerkId,
			},
			select: {
				...vendorProfileSelector,
				status: true,
			},
		});

		if (vendorProfile) {
			profile = vendorProfile;
			role = "vendor";
		}

		const logisticProfile = await prisma.logisticProfile.findUnique({
			where: {
				clerkId,
			},
			select: {
				...logisticProfileSelector,
				status: true,
			},
		});

		if (logisticProfile) {
			profile = logisticProfile;
			role = "logistic";
		}

		return { profile, role };
	},
);
