import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]),
		APP_URL: z.url(),
		DATABASE_URL: z.url(),
		CLERK_SECRET_KEY: z.string(),
		CLERK_SIGN_IN_URL: z.string(),
		CLERK_SIGN_UP_URL: z.string(),
		OZOW_SITE_CODE: z.string(),
		OZOW_PRIVATE_KEY: z.string(),
		OZOW_IS_TEST: z.coerce.boolean(),
		OZOW_API_URL: z.url(),
		OZOW_NOTIFY_URL: z.url(),
		OZOW_CANCEL_URL: z.url(),
		OZOW_SUCCESS_URL: z.url(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
