import { createFileRoute, Link } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export const Route = createFileRoute("/(public)/")({
	head: () => ({
		meta: [
			{
				title: "Home",
			},
			{
				name: "description",
				content:
					"Connect with eco-friendly builders and suppliers. Find sustainable construction materials and services on EcobuiltConnect.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: HomePage,
});

function HomePage() {
	return (
		<>
			<section className="container mx-auto px-4 pt-28 flex gap-12 flex-col-reverse md:flex-row items-center">
				<div className="flex-1 space-y-12">
					<div className="space-y-8">
						<h2 className="text-3xl md:text-6xl font-medium">
							<span>Cost-effective solutions for the</span>{" "}
							<span className="text-primary">construction sector.</span>
						</h2>
						<p className="text-lg">
							Save costs. Build sustainably. Buy or sell used or surplus
							construction materials with our trusted marketplace.
						</p>
					</div>
					<div className="flex gap-2 items-center">
						<Link
							to="/"
							className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
						>
							Learn more
						</Link>
						<Link
							to="/"
							className={cn(buttonVariants({ variant: "default", size: "lg" }))}
						>
							Get started
						</Link>
					</div>
				</div>
				<div className="flex-1">
					<img
						className="aspect-square object-contain w-full"
						src="/art-01.webp"
						alt="Art 01"
					/>
				</div>
			</section>
			<section className="container mx-auto px-4 pt-12 flex gap-12 flex-col md:flex-row items-center">
				<div className="flex-1">
					<img
						className="aspect-square object-contain w-full"
						src="/art-02.webp"
						alt="Art 02"
					/>
				</div>
				<div className="flex-1 space-y-12">
					<div className="space-y-8">
						<h2 className="text-3xl md:text-6xl font-medium">
							<span>We Help You</span>{" "}
							<span className="text-primary">Build Smarter!</span>
						</h2>
						<p className="text-lg">
							Our vetted vendors simplify sourcing of used materials, helping
							you lower costs and build greener projects — without compromising
							quality.
						</p>
					</div>
					<div className="flex gap-2 items-center">
						<Link
							to="/"
							className={cn(buttonVariants({ variant: "default", size: "lg" }))}
						>
							Browse vendors
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
