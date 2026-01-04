import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { s3 } from "../aws/s3";
import { env } from "../env/server";

export const generateS3ObjectUploadURL = createServerFn({
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
		} catch (_error) {
			throw new Error("Failed to generate signed URL");
		}
	});
