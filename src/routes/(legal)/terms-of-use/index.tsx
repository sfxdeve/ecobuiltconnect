import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(legal)/terms-of-use/")({
	head: () => ({
		meta: [
			{
				title: "Terms of Use",
			},
			{
				name: "description",
				content: "Terms of Use for EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: TermsOfUsePage,
});

function TermsOfUsePage() {
	return (
		<section className="container mx-auto py-12 px-4 pt-28 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
			<div className="prose prose-slate max-w-none">
				<h2 className="text-2xl font-semibold mt-8 mb-4">1. Access and Use</h2>
				<p className="mb-4">
					These Terms govern your <strong>access and use</strong> of the
					platform. By using the Website, you represent and warrant that:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>You will provide accurate, current, and complete information.</li>
					<li>
						You will use the platform lawfully and for its intended purpose.
					</li>
					<li>You will avoid any security abuse or misuse of the platform.</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					2. Intellectual Property Rights
				</h2>
				<p className="mb-4">
					All content, branding, source code, databases, functionality,
					software, website designs, audio, video, text, photographs, and
					graphics on the Website are{" "}
					<strong>EcoBuiltConnect’s intellectual property</strong> or licensed
					to us.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					3. Liability Limitations
				</h2>
				<p className="mb-4">
					We provide the platform "as-is". EcoBuiltConnect is{" "}
					<strong>not responsible</strong> for:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>Merchant product quality or compliance.</li>
					<li>Delivery delays or stock issues.</li>
					<li>Customer disputes caused by merchants.</li>
				</ul>
				<p className="mb-4">To the maximum extent permitted by law:</p>
				<ul className="list-disc pl-6 mb-4">
					<li>We are not liable for indirect or consequential damages.</li>
					<li>
						Our liability is capped at{" "}
						<strong>fees paid in the last 6 months</strong> (for merchants).
					</li>
					<li>
						No limitation applies where prohibited by law (CPA, POPIA, gross
						negligence).
					</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">4. Governing Law</h2>
				<p className="mb-4">
					These Terms shall be governed by and defined following the{" "}
					<strong>laws of South Africa</strong>.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
				<p className="mb-4">
					In order to resolve a complaint regarding the Website or to receive
					further information regarding use of the Website, please contact us at
					support@ecobuiltconnect.co.za
				</p>
			</div>
		</section>
	);
}
