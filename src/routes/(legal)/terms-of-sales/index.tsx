import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(legal)/terms-of-sales/")({
	head: () => ({
		meta: [
			{
				title: "Terms of Sale",
			},
			{
				name: "description",
				content: "Terms of Sale for EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: TermsOfSalePage,
});

function TermsOfSalePage() {
	return (
		<section className="container mx-auto py-12 px-4 pt-28 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Terms of Sale</h1>
			<div className="prose prose-slate max-w-none">
				<h2 className="text-2xl font-semibold mt-8 mb-4">
					1. Role of EcoBuiltConnect
				</h2>
				<p className="mb-4">
					EcoBuiltConnect acts as a <strong>marketplace intermediary</strong>,
					not the supplier of the goods.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					2. Orders and Pricing
				</h2>
				<p className="mb-4">
					Orders become binding <strong>once confirmed by the supplier</strong>.
					Prices are in <strong>ZAR</strong>, and VAT may apply. All orders are
					subject to acceptance and availability.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">3. Payment</h2>
				<p className="mb-4">
					Payments are handled via <strong>secure gateways</strong>. Payment
					must be made in full at the time of order unless otherwise agreed in
					writing.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					4. Shipping and Delivery
				</h2>
				<p className="mb-4">
					Delivery details are supplier-managed. Delivery times are estimates
					and not guaranteed.{" "}
					<strong>Risk transfers to buyer upon delivery</strong>.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">5. Returns and CPA</h2>
				<p className="mb-4">
					Returns are governed by the{" "}
					<strong>Consumer Protection Act (CPA)</strong>, especially for
					defective or misdescribed goods. Please refer to our{" "}
					<a href="/returns-policy" className="text-primary hover:underline">
						Returns & Refunds Policy
					</a>{" "}
					for more details.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
				<p className="mb-4">
					For questions regarding sales and orders, please contact
					support@ecobuiltconnect.co.za
				</p>
			</div>
		</section>
	);
}
