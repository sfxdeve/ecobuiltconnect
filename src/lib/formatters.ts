import { format, isValid, parseISO } from "date-fns";

export function formatDate(date: Date | string, formatString = "MMM dd, yyyy") {
	const d = typeof date === "string" ? parseISO(date) : date;

	if (!isValid(d)) return "";

	return format(d, formatString);
}

const moneyFmtCache = new Map<string, Intl.NumberFormat>();

function getMoneyFormatter(locale: string, currency: string) {
	const key = `${locale}|${currency}`;

	const cached = moneyFmtCache.get(key);

	if (cached) return cached;

	const fmt = new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
	});

	moneyFmtCache.set(key, fmt);

	return fmt;
}

export function formatMoneyFromCents(
	cents: number,
	opts: { locale: string; currency: string },
) {
	if (!Number.isFinite(cents)) return "";

	return getMoneyFormatter(opts.locale, opts.currency).format(cents / 100);
}
