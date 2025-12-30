import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUserProfile } from "@/lib/api/user.profile.ts";
import { prisma } from "@/prisma";
import { logisticRequestSelector } from "@/prisma/selectors.ts";

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
		const { userProfile } = await getUserProfile();

		const orderRequest = await prisma.orderRequest.findUnique({
			where: {
				id: data.orderRequestId,
				status: {
					notIn: ["PENDING", "CANCELLED"],
				},
				userProfile: { id: userProfile.id },
				logisticRequest: { is: null },
			},
		});

		if (!orderRequest) {
			throw new Error("Order request not found");
		}

		const logisticRequest = await prisma.logisticRequest.create({
			data,
			select: logisticRequestSelector,
		});

		return { logisticRequest };
	});
