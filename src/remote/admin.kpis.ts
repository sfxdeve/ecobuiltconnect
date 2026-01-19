import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/prisma";
import { getAdminProfile } from "@/remote/admin.profile";

export const getKpis = createServerFn({ method: "GET" }).handler(async () => {
	try {
		await getAdminProfile();

		const totalSales =
			(
				await prisma.orderRequest.aggregate({
					where: {
						status: "COMPLETED",
					},
					_sum: {
						total: true,
					},
				})
			)._sum.total ?? 0;

		const fullfilledOrderRequests = await prisma.orderRequest.count({
			where: {
				status: "COMPLETED",
			},
		});

		const liveProducts = await prisma.product.count({
			where: {
				isDeleted: false,
			},
		});

		const activeUserProfiles = await prisma.userProfile.count({
			where: {
				status: "APPROVED",
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

		throw new Error("Failed to fetch admin KPIs");
	}
});
