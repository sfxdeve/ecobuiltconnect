import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/$")({
	component: ProductDetailsPage,
});

function ProductDetailsPage() {
	return (
		<main className={"min-h-screen"}>
			<section
				className={
					"container mx-auto py-12 px-4 space-y-6 flex flex-col lg:flex-row gap-8"
				}
			>
				<div className={"flex-1"}></div>
				<div className={"flex-1"}></div>
			</section>
		</main>
	);
}
