import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { VendorHeader } from "@/components/blocks/vendor-header";

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
	component: VendorRequestsPage,
	pendingComponent: AppPending,
});

function VendorRequestsPage() {
	return (
		<>
			<VendorHeader title="Requests" />
			<main className="min-h-screen">
				<section></section>
			</main>
		</>
	);
}
