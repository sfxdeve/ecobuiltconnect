import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import { logisticRequestSelector } from "@/prisma/selectors";
import { getUserProfile } from "./profile";

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
			acceptedPrice: z
				.number("Accepted price must be a number")
				.min(1, "Accepted price must be at least 1")
				.transform((val) => val * 100)
				.optional(),
		}),
	)
	.handler(async ({ data }) => {
		const { profile } = await getUserProfile();

		const orderRequest = await prisma.orderRequest.findUnique({
			where: {
				id: data.orderRequestId,
				userProfile: { id: profile.id },
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
