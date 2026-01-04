import { createIsomorphicFn } from "@tanstack/react-start";
import { composeS3Url as composeS3UrlOnClient } from "./client.s3";
import { composeS3Url as composeS3UrlOnServer } from "./server.s3";

export const composeS3Url = createIsomorphicFn()
	.server(composeS3UrlOnServer)
	.client(composeS3UrlOnClient);
