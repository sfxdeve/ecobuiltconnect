import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env/server";
import { PrismaClient } from "@/generated/prisma/client.js";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	// Clear existing todos
	await prisma.todo.deleteMany();

	// Create example todos
	const todos = await prisma.todo.createMany({
		data: [
			{ title: "Buy groceries" },
			{ title: "Read a book" },
			{ title: "Workout" },
		],
	});

	console.log(`✅ Created ${todos.count} todos`);
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
