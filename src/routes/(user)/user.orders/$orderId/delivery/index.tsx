import { createFileRoute } from "@tanstack/react-router";
import { AppComingSoon } from "@/components/blocks/app-coming-soon";
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
	pendingComponent: AppPending,
	component: DeliveryPage,
});

function DeliveryPage() {
	return <AppComingSoon />;
}
