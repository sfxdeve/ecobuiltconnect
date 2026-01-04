import { createIsomorphicFn } from "@tanstack/react-start";
import { composeS3URL as composeS3URLOnClient } from "./client.s3";
import { composeS3URL as composeS3URLOnServer } from "./server.s3";

export const composeS3URL = createIsomorphicFn()
	.server(composeS3URLOnServer)
	.client(composeS3URLOnClient);

export const composeS3Key = (filename: string, prefix?: string) => {
	const timestamp = Date.now();

	const sanitized = filename
		.toLowerCase()
		// 1. Replace everything illegal with a dash
		.replace(/[^a-z0-9.-]/g, "-")
		// 2. Collapse multiple dashes into one
		.replace(/-+/g, "-")
		// 3. Remove dashes from the very start or end
		.replace(/^-+|-+$/g, "");

	// Clean the prefix: remove trailing slashes
	const cleanPrefix = prefix ? prefix.replace(/\/+$/g, "") : "";

	return cleanPrefix
		? `${cleanPrefix}/${timestamp}-${sanitized}`
		: `${timestamp}-${sanitized}`;
};
