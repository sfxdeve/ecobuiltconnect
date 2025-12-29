import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { VendorHeader } from "@/components/blocks/vendor-header";

export const Route = createFileRoute("/(vendor)/vendor/products/")({
	head: () => ({
		meta: [
			{
				title: "Products - EcobuiltConnect",
			},
			{
				name: "description",
				content: "Manage your product listings and inventory.",
			},
		],
	}),
	component: VendorProductsPage,
	pendingComponent: AppPending,
});

function VendorProductsPage() {
	return (
		<>
			<VendorHeader title="Products" />
			<main className="min-h-screen">
				<section></section>
			</main>
		</>
	);
}
