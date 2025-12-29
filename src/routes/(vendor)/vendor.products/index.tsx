import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";

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
	pendingComponent: AppPending,
	component: VendorProductsPage,
});

function VendorProductsPage() {
	return (
		<>
			<DashboardHeader title="Products" />
			<section className="min-h-screen"></section>
		</>
	);
}
