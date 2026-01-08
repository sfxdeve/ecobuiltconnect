import { createClientOnlyFn } from "@tanstack/react-start";
import { env } from "@/lib/env.client";

export const composeS3URL = createClientOnlyFn((key: string) => {
	return `https://${env.VITE_AWS_S3_BUCKET_NAME}.s3.${env.VITE_AWS_REGION}.amazonaws.com/${key}`;
});
