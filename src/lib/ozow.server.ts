import { createHash } from "node:crypto";
import { createServerOnlyFn } from "@tanstack/react-start";

export interface OzowPaymentRequest {
	siteCode: string;
	countryCode: string;
	currencyCode: string;
	amount: number;
	transactionReference: string;
	bankReference: string;
	cancelUrl: string;
	errorUrl: string;
	successUrl: string;
	notifyUrl: string;
	isTest: boolean;
}

export const generateOzowHash = createServerOnlyFn(
	(paymentRequestData: OzowPaymentRequest, privateKey: string) => {
		const hashString = [
			paymentRequestData.siteCode,
			paymentRequestData.countryCode,
			paymentRequestData.currencyCode,
			paymentRequestData.amount.toFixed(2),
			paymentRequestData.transactionReference,
			paymentRequestData.bankReference,
			paymentRequestData.cancelUrl,
			paymentRequestData.errorUrl,
			paymentRequestData.successUrl,
			paymentRequestData.notifyUrl,
			paymentRequestData.isTest.toString(),
			privateKey,
		]
			.join("")
			.toLowerCase();

		return createHash("sha512").update(hashString).digest("hex");
	},
);
