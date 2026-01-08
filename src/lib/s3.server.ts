import { S3Client } from "@aws-sdk/client-s3";
import { createServerOnlyFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";

export const s3 = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

export const composeS3URL = createServerOnlyFn((key: string) => {
	return `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
});
