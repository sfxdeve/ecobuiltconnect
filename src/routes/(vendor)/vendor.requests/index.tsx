import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";

export const Route = createFileRoute("/(vendor)/vendor/requests/")({
	head: () => ({
		meta: [
			{
				title: "Requests - EcobuiltConnect",
			},
			{
				name: "description",
				content: "View and respond to customer product requests.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorRequestsPage,
});

function VendorRequestsPage() {
	return (
		<>
			<DashboardHeader title="Requests" />
			<section className="min-h-screen"></section>
		</>
	);
}
