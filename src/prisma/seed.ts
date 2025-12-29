import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env/server";
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
	await prisma.review.deleteMany();
	await prisma.logisticResponse.deleteMany();
	await prisma.logisticRequest.deleteMany();
	await prisma.orderRequest.deleteMany();
	await prisma.orderItem.deleteMany();
	await prisma.productRequest.deleteMany();
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.vendorProfile.deleteMany();
	await prisma.logisticProfile.deleteMany();
	await prisma.adminProfile.deleteMany();
	// await prisma.userProfile.deleteMany();

	const userProfiles = await prisma.userProfile.findMany();

	// Create 5 fake vendors
	const vendorProfilesData = Array.from({ length: 5 }, () => ({
		clerkId: faker.string.uuid(),
		pictureId: "/test.jpg",
		name: faker.company.name(),
		description: faker.company.catchPhrase(),
		postcode: faker.location.zipCode(),
		city: faker.location.city(),
		address: faker.location.streetAddress(),
		status: faker.helpers.enumValue(ProfileStatus),
	}));
	await prisma.vendorProfile.createMany({ data: vendorProfilesData });
	const vendorProfiles = await prisma.vendorProfile.findMany();

	console.log(`✅ Created ${vendorProfilesData.length} vendors`);

	// Create 5 fake categories
	const categoriesData = Array.from({ length: 5 }, () => ({
		name: faker.commerce.department(),
		status: faker.helpers.enumValue(CategoryStatus),
	}));
	await prisma.category.createMany({ data: categoriesData });
	const categories = await prisma.category.findMany();

	console.log(`✅ Created ${categoriesData.length} categories`);

	// Create 20 fake products
	const productsData = Array.from({ length: 20 }, () => ({
		pictureIds: ["/test.jpg"],
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		previousUsage: faker.helpers.maybe(() => faker.lorem.sentence()),
		sku: faker.string.alphanumeric(10).toUpperCase(),
		stock: faker.number.int({ min: 0, max: 100 }),
		price: Math.round(
			parseFloat(faker.commerce.price({ min: 10, max: 500 })) * 100,
		),
		condition: faker.helpers.enumValue(ProductCondition),
		categoryId: faker.helpers.arrayElement(categories).id,
		vendorProfileId: faker.helpers.arrayElement(vendorProfiles).id,
	}));
	await prisma.product.createMany({ data: productsData });
	// const products = await prisma.product.findMany();

	console.log(`✅ Created ${productsData.length} products`);

	// Create 5 fake product requests
	const productRequestsData = Array.from({ length: 5 }, () => ({
		pictureIds: ["/test.jpg"],
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		quantity: faker.number.int({ min: 1, max: 10 }),
		price: Math.round(
			parseFloat(faker.commerce.price({ min: 10, max: 500 })) * 100,
		),
		categoryId: faker.helpers.arrayElement(categories).id,
		userProfileId: faker.helpers.arrayElement(userProfiles).id,
	}));
	await prisma.productRequest.createMany({ data: productRequestsData });

	console.log(`✅ Created ${productRequestsData.length} product requests`);
}

main()
	.catch((error) => {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
