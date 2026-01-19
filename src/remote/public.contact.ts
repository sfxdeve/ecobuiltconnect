import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const sendMessage = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			email: z.email("Email must be a valid email address"),
			subject: z
				.string("Subject must be a string")
				.min(3, "Subject must be at least 3 characters"),
			message: z
				.string("Message must be a string")
				.min(10, "Message must be at least 10 characters"),
		}),
	)
	.handler(async ({ data }) => {
		return { data };
	});
