import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/env/server";
import { generateOzowHash } from "@/lib/ozow";
import { getUserOrderRequestServerFn } from "./orders";

export const createOzowPaymentRequestServerFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			orderId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const { orderRequest } = await getUserOrderRequestServerFn({
			data: { orderRequestId: data.orderId },
		});

		const payload = {
			siteCode: env.OZOW_SITE_CODE,
			countryCode: "ZA",
			currencyCode: "ZAR",
			amount: orderRequest.total,
			transactionReference: orderRequest.id,
			bankReference: orderRequest.id.slice(0, 18),
			cancelUrl: env.OZOW_CANCEL_URL,
			errorUrl: env.OZOW_ERROR_URL,
			successUrl: env.OZOW_SUCCESS_URL,
			notifyUrl: env.OZOW_NOTIFY_URL,
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
