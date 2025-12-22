import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/community/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Community",
			},
		],
	}),
	component: CommunityPage,
});

function CommunityPage() {
	return <section className={"container mx-auto py-12 px-4"}></section>;
}
