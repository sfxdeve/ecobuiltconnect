import { createFileRoute } from "@tanstack/react-router";
import { AppCommingSoon } from "@/components/blocks/app-comming-soon";

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
	return <AppCommingSoon />;
}
