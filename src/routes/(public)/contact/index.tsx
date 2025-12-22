import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/contact/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Contact",
			},
		],
	}),
	component: ContactPage,
});

function ContactPage() {
	return (
		<section className={"container mx-auto py-12 px-4 space-y-6"}></section>
	);
}
