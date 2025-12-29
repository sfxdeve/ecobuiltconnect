import { createFileRoute } from "@tanstack/react-router";
import { AppComingSoon } from "@/components/blocks/app-coming-soon";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(public)/")({
	head: () => ({
		meta: [
			{
				title: "Home - EcobuiltConnect",
			},
			{
				name: "description",
				content:
					"Connect with eco-friendly builders and suppliers. Find sustainable construction materials and services on EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: HomePage,
});

function HomePage() {
	return <AppComingSoon />;
}
