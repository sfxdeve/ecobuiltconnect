import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { bankAccountSelector } from "@/prisma/selectors";
import { getAdminProfile } from "./admin.profile";

export const getBankAccount = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			vendorProfileId: z.uuid("Vendor profile id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await getAdminProfile();

			const bankAccount = await prisma.bankAccount.findUnique({
				where: {
					vendorProfileId: data.vendorProfileId,
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
