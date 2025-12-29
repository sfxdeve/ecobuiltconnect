import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";

export const Route = createFileRoute("/(vendor)/vendor/orders/")({
	head: () => ({
		meta: [
			{
				title: "Orders - EcobuiltConnect",
			},
			{
				name: "description",
				content: "Manage your vendor orders and shipments.",
			},
		],
	}),
	component: VendorOrdersPage,
	pendingComponent: AppPending,
});

function VendorOrdersPage() {
	return (
		<>
			<DashboardHeader title="Orders" />
			<main className="min-h-screen">
				<section></section>
			</main>
		</>
	);
}
