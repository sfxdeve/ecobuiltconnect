import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(vendor)/vendor/orders/")({
	head: () => ({
		meta: [
			{
				title: "Orders - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: VendorOrdersPage,
	pendingComponent: AppPending,
});

function VendorOrdersPage() {
	return <section className="p-4">Vendor Orders</section>;
}
