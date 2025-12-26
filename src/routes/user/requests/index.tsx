import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/requests/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Product Requests",
			},
		],
	}),
	component: RequestsPage,
});

function RequestsPage() {
	return <section className="container mx-auto py-12 px-4"></section>;
}
