import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(legal)/cookies-policy/")({
	head: () => ({
		meta: [
			{
				title: "Cookies Policy",
			},
			{
				name: "description",
				content: "Cookies Policy for EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: CookiesPolicyPage,
});

function CookiesPolicyPage() {
	return (
		<section className="container mx-auto py-12 px-4 pt-28 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Cookies Policy</h1>
			<div className="prose prose-slate max-w-none">
				<h2 className="text-2xl font-semibold mt-8 mb-4">
					1. What are cookies?
				</h2>
				<p className="mb-4">
					Cookies are small data files that are placed on your computer or
					mobile device when you visit a website. Cookies are widely used by
					website owners in order to make their websites work, or to work more
					efficiently, as well as to provide reporting information.
				</p>
				<p className="mb-4">
					We use cookies to{" "}
					<strong>
						improve functionality, analyze traffic, personalize content, and
						deliver ads
					</strong>
					.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					2. Cookie Categories
				</h2>
				<ul className="list-disc pl-6 mb-4">
					<li>
						<strong>Essential:</strong> Required for core site functionality.
					</li>
					<li>
						<strong>Performance:</strong> Analytics and usage insights.
					</li>
					<li>
						<strong>Functional:</strong> Saves preferences.
					</li>
					<li>
						<strong>Advertising:</strong> Relevant promotions.
					</li>
				</ul>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					3. How can I control cookies?
				</h2>
				<p className="mb-4">
					Users can{" "}
					<strong>block or delete cookies via browser settings</strong>, but
					this may reduce site functionality.
				</p>
				<p className="mb-4">
					Continued use of the site implies <strong>consent</strong>.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					4. Updates to this policy
				</h2>
				<p className="mb-4">
					We may update this Cookie Policy from time to time in order to
					reflect, for example, changes to the cookies we use or for other
					operational, legal or regulatory reasons. Please therefore re-visit
					this Cookie Policy regularly to stay informed about our use of cookies
					and related technologies.
				</p>

				<h2 className="text-2xl font-semibold mt-8 mb-4">
					5. Where can I get further information?
				</h2>
				<p className="mb-4">
					If you have any questions about our use of cookies or other
					technologies, please email us at support@ecobuiltconnect.co.za
				</p>
			</div>
		</section>
	);
}
