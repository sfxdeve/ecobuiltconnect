import { createFileRoute } from "@tanstack/react-router";
import { CommingSoon } from "@/components/blocks/comming-soon";

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
	return (
		<section className="container mx-auto py-12 px-4 h-[calc(100vh-16rem)] flex flex-col gap-4 items-center justify-center">
			<CommingSoon />
		</section>
	);
}
