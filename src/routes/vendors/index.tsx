import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vendors/")({
	component: VendorsPage,
});

function VendorsPage() {
	return <div>Hello "/vendors/"!</div>;
}
