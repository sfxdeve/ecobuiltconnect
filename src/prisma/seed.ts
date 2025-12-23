import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env/server";
import { PrismaClient } from "./generated/client";
import {
	CategoryStatus,
	ProductCondition,
	ProfileStatus,
} from "./generated/enums";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	// Clear existing records
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.vendorProfile.deleteMany();

	// Create 5 fake categories
	const categoriesData = Array.from({ length: 5 }, () => ({
		name: faker.commerce.department(),
		status: faker.helpers.enumValue(CategoryStatus),
	}));
	await prisma.category.createMany({ data: categoriesData });

	console.log(`✅ Created ${categoriesData.length} categories`);

	// Create 5 fake vendors
	const vendorsData = Array.from({ length: 5 }, () => ({
		clerkId: faker.string.uuid(),
		pictureId: "/test.jpg",
		name: faker.company.name(),
		description: faker.company.catchPhrase(),
		postcode: faker.location.zipCode(),
		city: faker.location.city(),
		address: faker.location.streetAddress(),
		status: faker.helpers.enumValue(ProfileStatus),
	}));
	await prisma.vendorProfile.createMany({ data: vendorsData });

	console.log(`✅ Created ${vendorsData.length} vendors`);

	// required for products
	const categories = await prisma.category.findMany();
	const vendors = await prisma.vendorProfile.findMany();

	// Create 20 fake products
	const products = Array.from({ length: 20 }, () => ({
		pictureIds: ["/test.jpg"],
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		previousUsage: faker.helpers.maybe(() => faker.lorem.sentence()),
		sku: faker.string.alphanumeric(10).toUpperCase(),
		stock: faker.number.int({ min: 0, max: 100 }),
		price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
		condition: faker.helpers.enumValue(ProductCondition),
		categoryId: faker.helpers.arrayElement(categories).id,
		vendorId: faker.helpers.arrayElement(vendors).id,
	}));
	await prisma.product.createMany({ data: products });

	console.log(`✅ Created ${products.length} products`);
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
