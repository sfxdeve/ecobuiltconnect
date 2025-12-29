import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { VendorHeader } from "@/components/blocks/vendor-header";

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
	component: VendorDashboardPage,
	pendingComponent: AppPending,
});

function VendorDashboardPage() {
	return (
		<>
			<VendorHeader title="Dashboard" />
			<main className="min-h-screen">
				<section></section>
			</main>
		</>
	);
}
