import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact/")({
	component: ContactPage,
});

function ContactPage() {
	return (
		<main className={"min-h-screen"}>
			<section className={"container mx-auto py-12 space-y-6"}></section>
		</main>
	);
}
