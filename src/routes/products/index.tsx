import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/")({
	component: ProductsPage,
});

function ProductsPage() {
	return <div>Hello "/products/"!</div>;
}
