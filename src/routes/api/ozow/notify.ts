import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/env/server";
import { verifyOzowCallbackHash } from "@/lib/ozow";
import { prisma } from "@/prisma";

export const Route = createFileRoute("/api/ozow/notify")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const formData = await request.formData();

				const data = Object.fromEntries(formData.entries());

				if (!data.TransactionReference || !data.HashCheck) {
					return new Response("Invalid data", { status: 400 });
				}

				const isValid = verifyOzowCallbackHash(
					data.HashCheck as string,
					data as Record<string, unknown>,
					env.OZOW_PRIVATE_KEY,
				);

				if (!isValid) {
					return new Response("Invalid Hash", { status: 403 });
				}

				if (data.Status === "Complete" || data.Status === "Paid") {
					await prisma.orderRequest.update({
						where: { id: data.TransactionReference as string },
						data: { status: "PAID" },
					});
				}

				return new Response("Success", { status: 200 });
			},
		},
	},
});
