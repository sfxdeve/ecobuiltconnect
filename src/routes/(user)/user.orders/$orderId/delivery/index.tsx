import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(user)/user/orders/$orderId/delivery/")({
	head: () => ({
		meta: [
			{
				title: "Order Deliveries - EcobuiltConnect",
			},
			{
				name: "description",
				content: "View your order delivery details",
			},
		],
	}),
	component: DeliveryPage,
	pendingComponent: AppPending,
});

function DeliveryPage() {
	return <section className="container mx-auto py-12 px-4 space-y-6"></section>;
}
