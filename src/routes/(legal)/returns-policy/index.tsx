import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(legal)/returns-policy/")({
	head: () => ({
		meta: [
			{
				title: "Returns & Refunds Policy",
			},
			{
				name: "description",
				content: "Returns & Refunds Policy for EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
	return (
		<section className="container mx-auto py-12 px-4 pt-28 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Returns & Refunds Policy</h1>
			<div className="prose prose-slate max-w-none">
				<h2 className="text-2xl font-semibold mt-8 mb-4">
					1. General (New Goods)
				</h2>
				<p className="mb-4">
					EcobuiltConnect supports the{" "}
					<strong>Consumer Protection Act (CPA)</strong>.
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>7-day cooling-off period for online purchases.</li>
					<li>
						Returns require: unused goods, original packaging, and proof of
						purchase.
					</li>
					<li>
						Refunds processed within <strong>14 business days</strong>.
					</li>
					<li>Exclusions: custom-made or perishable goods.</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					2. Second-Hand Materials (Strict Rules)
				</h2>
				<p className="mb-4">
					Sold <strong>“as-is”</strong> — buyer due diligence is expected.
					Returns allowed <strong>only if</strong>:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>Item is materially defective.</li>
					<li>Item is not as described.</li>
					<li>Wrong item supplied.</li>
				</ul>
				<p className="mb-4">No returns for:</p>
				<ul className="list-disc pl-6 mb-4">
					<li>Change of mind, buyer error, or incorrect quantities.</li>
					<li>
						Items that were <strong>used, altered, cut, or installed</strong>.
					</li>
					<li>
						Certain items are <strong>non-returnable</strong> (cement, sand,
						clearance items).
					</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">3. Courier Costs</h2>
				<ul className="list-disc pl-6 mb-4">
					<li>Supplier pays if at fault.</li>
					<li>Buyer pays otherwise.</li>
				</ul>
				<p className="mb-4">
					EcoBuiltConnect may offer{" "}
					<strong>replacement or credit instead of refund</strong>.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">4. Contact Us</h2>
				<p className="mb-4">
					If you have any questions on how to return your item to us, contact us
					at support@ecobuiltconnect.co.za
				</p>
			</div>
		</section>
	);
}
