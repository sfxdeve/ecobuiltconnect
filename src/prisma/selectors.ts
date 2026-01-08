import type {
	AdminProfileSelect,
	CategorySelect,
	LogisticProfileSelect,
	LogisticRequestSelect,
	LogisticResponseSelect,
	OrderItemSelect,
	OrderRequestSelect,
	ProductRequestSelect,
	ProductSelect,
	ReviewSelect,
	UserProfileSelect,
	VendorProfileSelect,
} from "@/prisma/generated/models";

export const userProfileSelector = {
	id: true,
	clerkId: true,
	name: true,
	address: true,
	city: true,
	postcode: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies UserProfileSelect;

export const vendorProfileSelector = {
	id: true,
	clerkId: true,
	pictureKeys: true,
	name: true,
	description: true,
	address: true,
	city: true,
	postcode: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies VendorProfileSelect;

export const logisticProfileSelector = {
	id: true,
	clerkId: true,
	pictureKeys: true,
	name: true,
	description: true,
	address: true,
	city: true,
	postcode: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies LogisticProfileSelect;

export const adminProfileSelector = {
	id: true,
	clerkId: true,
	name: true,
	description: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies AdminProfileSelect;

export const categorySelector = {
	id: true,
	name: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies CategorySelect;

export const productSelector = {
	id: true,
	pictureKeys: true,
	name: true,
	description: true,
	previousUsage: true,
	sku: true,
	stock: true,
	price: true,
	salePrice: true,
	condition: true,
	isVerified: true,
	createdAt: true,
	updatedAt: true,
} satisfies ProductSelect;

export const productRequestSelector = {
	id: true,
	pictureKeys: true,
	name: true,
	description: true,
	quantity: true,
	price: true,
	createdAt: true,
	updatedAt: true,
} satisfies ProductRequestSelect;

export const orderItemSelector = {
	id: true,
	quantity: true,
	price: true,
	createdAt: true,
	updatedAt: true,
} satisfies OrderItemSelect;

export const orderRequestSelector = {
	id: true,
	total: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies OrderRequestSelect;

export const logisticRequestSelector = {
	id: true,
	requestedPrice: true,
	acceptedPrice: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} satisfies LogisticRequestSelect;

export const logisticResponseSelector = {
	id: true,
	price: true,
	createdAt: true,
	updatedAt: true,
} satisfies LogisticResponseSelect;

export const reviewSelector = {
	id: true,
	rating: true,
	comment: true,
	createdAt: true,
	updatedAt: true,
} satisfies ReviewSelect;
