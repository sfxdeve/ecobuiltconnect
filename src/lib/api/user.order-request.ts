import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "@/prisma";
import {
	logisticRequestSelector,
	orderItemSelector,
	orderRequestSelector,
	productSelector,
	reviewSelector,
} from "@/prisma/selectors";
import { getUserProfile } from "./user.profile";

export const getOrderRequest = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			orderRequestId: z.uuid("Order request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { userProfile } = await getUserProfile();

		const orderRequest = await prisma.orderRequest.findUnique({
			where: {
				id: data.orderRequestId,
				userProfile: { id: userProfile.id },
			},
			select: {
				...orderRequestSelector,
				orderItems: {
					select: {
						...orderItemSelector,
						product: {
							select: productSelector,
						},
						review: {
							select: reviewSelector,
						},
					},
				},
				logisticRequest: {
					select: logisticRequestSelector,
				},
			},
		});

		if (!orderRequest) {
			throw new Error("Order request not found");
		}

		return { orderRequest };
	});
