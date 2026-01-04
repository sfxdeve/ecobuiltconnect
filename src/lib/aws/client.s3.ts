import { createClientOnlyFn } from "@tanstack/react-start";
import { env } from "../env/client";

export const composeS3Url = createClientOnlyFn((key: string) => {
	return `https://${env.VITE_AWS_S3_BUCKET_NAME}.s3.${env.VITE_AWS_REGION}.amazonaws.com/${key}`;
});
