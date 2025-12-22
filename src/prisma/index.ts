import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env/server";
import { PrismaClient } from "@/prisma/generated/client.js";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

declare global {
	var __db: PrismaClient | undefined;
}

export const db = globalThis.__db || new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
	globalThis.__db = db;
}
