import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Home",
			},
		],
	}),
	component: HomePage,
});

function HomePage() {
	return <section className="container mx-auto py-12 px-4"></section>;
}
