import { auth } from "@clerk/tanstack-react-start/server";
import { createServerOnlyFn } from "@tanstack/react-start";

export const getClerkId = createServerOnlyFn(async () => {
	const { userId: clerkId } = await auth();

	if (!clerkId) {
		throw new Error("Unauthorized");
	}

	return { clerkId };
});
