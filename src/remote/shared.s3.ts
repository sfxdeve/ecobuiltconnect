import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/lib/env.server";
import { s3 } from "@/lib/s3.server";

export const getS3ObjectUploadURL = createServerFn({
	method: "GET",
})
	.inputValidator(
		z.object({
			key: z.string("Key must be a string"),
			contentType: z.string("Content type must be a string"),
		}),
	)
	.handler(async ({ data }) => {
		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: data.key,
			ContentType: data.contentType,
		});

		try {
			const url = await getSignedUrl(s3, command, { expiresIn: 60 });

			return { url };
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}

			throw new Error("Failed to fetch signed URL");
		}
	});
