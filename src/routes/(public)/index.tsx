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
				content: "",
			},
		],
	}),
	component: HomePage,
	pendingComponent: AppPending,
});

function HomePage() {
	return <AppComingSoon />;
}
