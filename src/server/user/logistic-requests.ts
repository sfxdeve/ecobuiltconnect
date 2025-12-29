import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUserProfile } from "@/lib/api/user.profile";
import { prisma } from "@/prisma";
import { logisticRequestSelector } from "@/prisma/selectors";

export const createLogisticRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			orderRequestId: z.uuid("Order request id must be valid UUID"),
			requestedPrice: z
				.number("Requested price must be a number")
				.min(1, "Requested price must be at least 1")
				.transform((val) => val * 100),
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
			},
		});

		if (!orderRequest) {
			throw new Error("Order request not found");
		}

		const existingLogisticRequest = await prisma.logisticRequest.findUnique({
			where: {
				orderRequestId: data.orderRequestId,
			},
		});

		if (existingLogisticRequest) {
			throw new Error("A logistic request already exists for this order");
		}

		const logisticRequest = await prisma.logisticRequest.create({
			data,
			select: logisticRequestSelector,
		});

		return { logisticRequest };
	});
