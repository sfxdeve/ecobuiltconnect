import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/env/server";
import { generateOzowHash } from "@/lib/ozow";
import { getUserOrderRequestServerFn } from "./orders";

export const createUserOzowPaymentUrlServerFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			orderId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const { orderRequest: order } = await getUserOrderRequestServerFn({
			data: { orderRequestId: data.orderId },
		});

		const hashCheck = generateOzowHash({
			siteCode: env.OZOW_SITE_CODE,
			countryCode: "ZA",
			currencyCode: "ZAR",
			amount: order.total.toFixed(2),
			transactionReference: order.id,
			bankReference: order.id,
			cancelUrl: env.OZOW_CANCEL_URL,
			successUrl: env.OZOW_SUCCESS_URL,
			notifyUrl: env.OZOW_NOTIFY_URL,
			isTest: env.OZOW_IS_TEST ? "true" : "false",
			privateKey: env.OZOW_PRIVATE_KEY,
		});

		const payload = {
			SiteCode: env.OZOW_SITE_CODE,
			CountryCode: "ZA",
			CurrencyCode: "ZAR",
			Amount: order.total.toFixed(2),
			TransactionReference: order.id,
			BankReference: order.id,
			CancelUrl: env.OZOW_CANCEL_URL,
			SuccessUrl: env.OZOW_SUCCESS_URL,
			NotifyUrl: env.OZOW_NOTIFY_URL,
			IsTest: env.OZOW_IS_TEST,
			HashCheck: hashCheck,
		};

		const response = await fetch(`${env.OZOW_API_URL}/postpaymentrequest`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const result = await response.json();

		if (!result.RedirectUrl) {
			throw new Error("No redirect URL received from Ozow");
		}

		return { redirectUrl: result.RedirectUrl };
	});
