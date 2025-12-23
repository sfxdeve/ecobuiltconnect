import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/vendors/$vendorId/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Vendor Details",
			},
		],
	}),
	component: VendorDetailsPage,
});

function VendorDetailsPage() {
	return <section className="container mx-auto py-12 px-4"></section>;
}
