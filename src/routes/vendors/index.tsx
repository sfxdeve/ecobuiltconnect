import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vendors/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Vendors",
			},
		],
	}),
	component: VendorsPage,
});

function VendorsPage() {
	return (
		<main className={"min-h-screen"}>
			<section className={"container mx-auto py-12 px-4 space-y-6"}></section>
		</main>
	);
}
