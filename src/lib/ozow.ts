import crypto from "crypto";

export function generateOzowHash({
	siteCode,
	countryCode,
	currencyCode,
	amount,
	transactionReference,
	bankReference,
	notifyUrl,
	isTest,
	privateKey,
}: {
	siteCode: string;
	countryCode: string;
	currencyCode: string;
	amount: number;
	transactionReference: string;
	bankReference: string;
	notifyUrl: string;
	isTest: boolean;
	privateKey: string;
}): string {
	const rawString = `${siteCode}${countryCode}${currencyCode}${amount}${transactionReference}${bankReference}${notifyUrl}${isTest}`;

	const stringToHash = rawString + privateKey;

	const lowercaseString = stringToHash.toLowerCase();

	return crypto.createHash("sha512").update(lowercaseString).digest("hex");
}

export function verifyOzowCallbackHash(
	receivedHash: string,
	// biome-ignore lint/suspicious/noExplicitAny: ik
	data: Record<string, any>,
	privateKey: string,
): boolean {
	const rawString = `${data.SiteCode}${data.CountryCode}${data.CurrencyCode}${data.Amount}${data.TransactionReference}${data.BankReference}${data.Status}${privateKey}`;

	const calculatedHash = crypto
		.createHash("sha512")
		.update(rawString.toLowerCase())
		.digest("hex");

	return calculatedHash === receivedHash;
}
