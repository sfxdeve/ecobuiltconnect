import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { bankAccountSelector } from "@/prisma/selectors";
import { getVendorProfile } from "@/remote/vendor.profile";

export const getBankAccount = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		const { vendorProfile } = await getVendorProfile();

		const bankAccount = await prisma.bankAccount.findUnique({
			where: {
				vendorProfileId: vendorProfile.id,
			},
			select: bankAccountSelector,
		});

		if (!bankAccount) {
			throw new Error("Bank account not found");
		}

		return { bankAccount };
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		throw new Error("Failed to fetch bank account");
	}
});

export const upsertBankAccount = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			bankName: z
				.string("Bank name must be a string")
				.min(3, "Bank name must be at least 3 characters"),
			branchCode: z
				.string("Branch code must be a string")
				.min(3, "Branch code must be at least 3 characters"),
			accountType: z
				.string("Account type must be a string")
				.min(3, "Account type must be at least 3 characters"),
			accountName: z
				.string("Account name must be a string")
				.min(3, "Account name must be at least 3 characters"),
			accountNumber: z
				.string("Account number must be a string")
				.min(3, "Account number must be at least 3 characters"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { vendorProfile } = await getVendorProfile();

			const bankAccount = await prisma.bankAccount.upsert({
				where: {
					vendorProfileId: vendorProfile.id,
				},
				update: {
					...data,
				},
				create: {
					...data,
					vendorProfileId: vendorProfile.id,
				},
				select: bankAccountSelector,
			});

			return { bankAccount };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to upsert bank account");
		}
	});
