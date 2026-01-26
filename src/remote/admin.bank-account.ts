import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { bankAccountSelector } from "@/prisma/selectors";
import { getAdminProfile } from "@/remote/admin.profile";
import { RemoteError } from "@/remote/error";

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
					vendorProfile: {
						status: "APPROVED",
					},
				},
				select: bankAccountSelector,
			});

			if (!bankAccount) {
				throw new RemoteError("Bank account not found");
			}

			return { bankAccount };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to fetch bank account");
		}
	});
