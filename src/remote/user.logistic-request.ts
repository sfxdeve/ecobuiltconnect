import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { logisticRequestSelector } from "@/prisma/selectors.ts";
import { RemoteError } from "@/remote/error";
import { getUserProfile } from "@/remote/user.profile";

export const createLogisticRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			requestedPrice: z
				.number("Requested price must be a number")
				.positive("Requested price must be a positive number")
				.transform((val) => val * 100),
			orderRequestId: z.uuid("Order request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { userProfile } = await getUserProfile();

			const orderRequest = await prisma.orderRequest.findUnique({
				where: {
					id: data.orderRequestId,
					status: {
						notIn: ["PENDING", "CANCELLED"],
					},
					userProfileId: userProfile.id,
					logisticRequest: null,
				},
			});

			if (!orderRequest) {
				throw new RemoteError("Order request not found");
			}

			const logisticRequest = await prisma.logisticRequest.create({
				data,
				select: logisticRequestSelector,
			});

			return { logisticRequest };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to create logistic request");
		}
	});
