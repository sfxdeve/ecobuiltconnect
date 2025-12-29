import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

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
	return <section className="p-4">Vendor Requests</section>;
}
