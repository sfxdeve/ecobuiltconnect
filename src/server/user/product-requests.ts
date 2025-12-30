import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUserProfile } from "@/lib/api/user.profile";
import { prisma } from "@/prisma";
import { productRequestSelector } from "@/prisma/selectors";

export const createProductRequest = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			pictureIds: z
				.array(z.string("Picture id must be a string"))
				.min(1, "At least one picture is required"),
			name: z
				.string("Name must be a string")
				.min(3, "Name must be at least 3 characters"),
			description: z
				.string("Description must be a string")
				.min(10, "Description must be at least 10 characters"),
			quantity: z
				.int("Quantity must be an integer")
				.min(1, "Quantity must be at least 1"),
			price: z
				.number("Price must be a number")
				.min(1, "Price must be at least 1")
				.transform((val) => val * 100),
			categoryId: z.uuid("Category id must be valid UUID"),
		}),
	)
	.handler(async ({ data }) => {
		const { userProfile } = await getUserProfile();

		const category = await prisma.category.findUnique({
			where: {
				id: data.categoryId,
				status: "APPROVED",
				isDeleted: false,
			},
		});

		if (!category) {
			throw new Error("Category not found or not approved");
		}

		const productRequest = await prisma.productRequest.create({
			data: {
				...data,
				userProfileId: userProfile.id,
			},
			select: productRequestSelector,
		});

		return { productRequest };
	});
