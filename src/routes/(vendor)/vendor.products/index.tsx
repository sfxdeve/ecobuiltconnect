import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(vendor)/vendor/products/")({
	head: () => ({
		meta: [
			{
				title: "Products - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: VendorProductsPage,
	pendingComponent: AppPending,
});

function VendorProductsPage() {
	return <section className="p-4">Vendor Products</section>;
}
