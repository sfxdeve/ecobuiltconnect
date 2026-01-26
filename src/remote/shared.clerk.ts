import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { RemoteError } from "@/remote/error";

export const getClerkId = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const { userId: clerkId } = await auth();

			if (!clerkId) {
				throw new RemoteError("Unauthorized");
			}

			return { clerkId };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			if (error instanceof RemoteError) {
				throw error;
			}

			throw new Error("Failed to resolve clerk user");
		}
	},
);
