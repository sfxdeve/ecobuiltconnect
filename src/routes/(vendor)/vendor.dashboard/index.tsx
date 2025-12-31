import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";

export const Route = createFileRoute("/(vendor)/vendor/dashboard/")({
	head: () => ({
		meta: [
			{
				title: "Dashboard - EcobuiltConnect",
			},
			{
				name: "description",
				content:
					"Vendor dashboard overview. Monitor sales, orders, and performance.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorDashboardPage,
});

function VendorDashboardPage() {
	return (
		<>
			<DashboardHeader title="Dashboard" />
			<section className="p-4 min-h-screen"></section>
		</>
	);
}
