import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/lib/env.server";
import { generateOzowHash } from "@/lib/ozow.server";
import { getOrderRequest } from "./user.order-request";

export const initiateOrderRequestPayment = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			orderRequestId: z.uuid("Order request id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { orderRequest } = await getOrderRequest({
			data: { orderRequestId: data.orderRequestId },
		});

		const payload = {
			siteCode: env.OZOW_SITE_CODE,
			countryCode: "ZA",
			currencyCode: "ZAR",
			amount: orderRequest.total / 100,
			transactionReference: orderRequest.id,
			bankReference: orderRequest.id.slice(24),
			cancelUrl: env.APP_URL + env.OZOW_CANCEL_URL,
			errorUrl: env.APP_URL + env.OZOW_ERROR_URL,
			successUrl: env.APP_URL + env.OZOW_SUCCESS_URL,
			notifyUrl: env.APP_URL + env.OZOW_NOTIFY_URL,
			isTest: env.OZOW_IS_TEST === "true",
		};

		const hashCheck = generateOzowHash(payload, env.OZOW_PRIVATE_KEY);

		const response = await fetch(`${env.OZOW_API_URL}/postpaymentrequest`, {
			method: "POST",
			headers: {
				ApiKey: env.OZOW_API_KEY,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...payload,
				hashCheck,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();

			throw new Error(`Ozow API error: ${response.status} - ${errorText}`);
		}

		const { url } = (await response.json()) as { url: string };

		return { redirectUrl: url };
	});
