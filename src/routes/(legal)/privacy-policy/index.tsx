import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(legal)/privacy-policy/")({
	head: () => ({
		meta: [
			{
				title: "Privacy Policy",
			},
			{
				name: "description",
				content: "Privacy Policy for EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<section className="container mx-auto py-12 px-4 pt-28 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
			<div className="prose prose-slate max-w-none">
				<h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
				<p className="mb-4">
					Welcome to EcobuiltConnect. We are committed to protecting your
					personal information and your right to privacy. This Privacy Policy is
					fully compliant with{" "}
					<strong>
						South Africa’s POPIA (Protection of Personal Information Act)
					</strong>
					.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					2. Information We Collect
				</h2>
				<p className="mb-4">
					We collect personal information that you voluntarily provide to us
					when registering at the Website, expressing an interest in obtaining
					information about us or our products and services, when participating
					in activities on the Website or otherwise contacting us. This
					includes:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>
						<strong>Personal details:</strong> name, contact info.
					</li>
					<li>
						<strong>Business details:</strong> company, VAT.
					</li>
					<li>
						<strong>Transaction data:</strong> orders, payments.
					</li>
					<li>
						<strong>Technical data:</strong> IP, device, cookies.
					</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					3. How We Use Your Information
				</h2>
				<p className="mb-4">
					We process your personal information for the following purposes:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>Operate the marketplace.</li>
					<li>Process payments and deliveries.</li>
					<li>Communicate updates and promotions.</li>
					<li>Meet legal obligations.</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					4. Your Rights under POPIA
				</h2>
				<p className="mb-4">
					You have the following rights regarding your personal information:
				</p>
				<ul className="list-disc pl-6 mb-4">
					<li>Access, correction, deletion.</li>
					<li>Objection to processing.</li>
					<li>Withdrawal of consent.</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					5. Data Security and Retention
				</h2>
				<p className="mb-4">
					We have <strong>strong security safeguards</strong> in place to
					protect your data. We retain data{" "}
					<strong>only as long as legally and operationally necessary</strong>.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					6. Data Protection Officer
				</h2>
				<p className="mb-4">
					We have a dedicated <strong>Data Protection Officer</strong>. If you
					have questions or comments about this policy, you may email us at
					support@ecobuiltconnect.co.za
				</p>
			</div>
		</section>
	);
}
