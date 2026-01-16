import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const getClerkId = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const { userId: clerkId } = await auth();

			if (!clerkId) {
				throw new Error("Unauthorized");
			}

			return { clerkId };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to resolve clerk user");
		}
	},
);
