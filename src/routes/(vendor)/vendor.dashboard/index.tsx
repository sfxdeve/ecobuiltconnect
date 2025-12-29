import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(vendor)/vendor/dashboard/")({
	head: () => ({
		meta: [
			{
				title: "Dashboard - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: VendorDashboardPage,
	pendingComponent: AppPending,
});

function VendorDashboardPage() {
	return <section className="p-4">Vendor Dashboard</section>;
}
