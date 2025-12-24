import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(user)/orders/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Orders",
			},
		],
	}),
	component: OrdersPage,
});

function OrdersPage() {
	return <section className="container mx-auto py-12 px-4"></section>;
}
