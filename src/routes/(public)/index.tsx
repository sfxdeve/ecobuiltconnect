import { createFileRoute } from "@tanstack/react-router";
import { AppComingSoon } from "@/components/blocks/app-coming-soon";

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
});

function HomePage() {
	return <AppComingSoon />;
}
