import crypto from "crypto";

export function generateOzowHash({
	siteCode,
	countryCode,
	currencyCode,
	amount,
	transactionReference,
	bankReference,
	cancelUrl,
	successUrl,
	notifyUrl,
	isTest,
	privateKey,
}: {
	siteCode: string;
	countryCode: string;
	currencyCode: string;
	amount: string;
	transactionReference: string;
	bankReference: string;
	cancelUrl: string;
	successUrl: string;
	notifyUrl: string;
	isTest: string;
	privateKey: string;
}): string {
	const rawString =
		siteCode +
		countryCode +
		currencyCode +
		amount +
		transactionReference +
		bankReference +
		cancelUrl +
		successUrl +
		notifyUrl +
		isTest;

	const stringToHash = rawString + privateKey;

	return crypto
		.createHash("sha512")
		.update(stringToHash.toLowerCase())
		.digest("hex");
}

export function verifyOzowCallbackHash(
	receivedHash: string,
	data: Record<string, unknown>,
	privateKey: string,
): boolean {
	const rawString = `${data.SiteCode}${data.CountryCode}${data.CurrencyCode}${data.Amount}${data.TransactionReference}${data.BankReference}${data.Status}${privateKey}`;

	const calculatedHash = crypto
		.createHash("sha512")
		.update(rawString.toLowerCase())
		.digest("hex");

	return calculatedHash === receivedHash;
}
