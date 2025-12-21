import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	return (
		<main className={"min-h-screen"}>
			<section className={"container mx-auto py-12 space-y-6"}></section>
		</main>
	);
}
