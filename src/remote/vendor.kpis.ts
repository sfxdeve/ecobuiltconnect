import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/prisma";
import { getVendorProfile } from "./vendor.profile";

export const getKpis = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const { vendorProfile } = await getVendorProfile();

		const totalSales =
			(
				await prisma.orderRequest.aggregate({
					where: {
						status: "COMPLETED",
						orderItems: {
							every: {
								product: {
									vendorProfile: {
										id: vendorProfile.id,
									},
								},
							},
						},
					},
					_sum: {
						total: true,
					},
				})
			)._sum.total ?? 0;

		const fullfilledOrderRequests = await prisma.orderRequest.count({
			where: {
				status: "COMPLETED",
				orderItems: {
					every: {
						product: {
							vendorProfile: {
								id: vendorProfile.id,
							},
						},
					},
				},
			},
		});

		const liveProducts = await prisma.product.count({
			where: {
				isDeleted: false,
				vendorProfile: {
					id: vendorProfile.id,
				},
			},
		});

		const activeUserProfiles = await prisma.userProfile.count({
			where: {
				status: "APPROVED",
				orderRequests: {
					some: {
						orderItems: {
							every: {
								product: {
									vendorProfile: {
										id: vendorProfile.id,
									},
								},
							},
						},
					},
				},
			},
		});

		return {
			totalSales,
			fullfilledOrderRequests,
			liveProducts,
			activeUserProfiles,
		};
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		throw new Error("Failed to fetch vendor KPIs");
	}
});
