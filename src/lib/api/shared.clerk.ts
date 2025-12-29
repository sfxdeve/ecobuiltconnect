import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const getClerkId = createServerFn({ method: "GET" }).handler(
	async () => {
		const { userId: clerkId } = await auth();

		if (!clerkId) {
			throw new Error("Unauthorized");
		}

		return { clerkId };
	},
);
