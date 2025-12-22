import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/products/$productId/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Product Details",
			},
		],
	}),
	component: ProductDetailsPage,
});

function ProductDetailsPage() {
	return (
		<section
			className={
				"container mx-auto py-12 px-4 space-y-6 flex flex-col lg:flex-row gap-8"
			}
		>
			<div className={"flex-1"}></div>
			<div className={"flex-1"}></div>
		</section>
	);
}
