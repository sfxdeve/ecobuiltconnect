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
			<section>
				<div className="container mx-auto py-12 px-4 pt-28 flex gap-12 flex-col-reverse md:flex-row items-center">
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
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
								)}
							>
								Learn more
							</Link>
							<Link
								to="/"
								className={cn(
									buttonVariants({ variant: "default", size: "lg" }),
								)}
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
				</div>
			</section>
			<section className="bg-primary/2.5">
				<div className="container mx-auto py-12 px-4 flex gap-12 flex-col md:flex-row items-center">
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
								you lower costs and build greener projects — without
								compromising quality.
							</p>
						</div>
						<div className="flex gap-2 items-center">
							<Link
								to="/"
								className={cn(
									buttonVariants({ variant: "default", size: "lg" }),
								)}
							>
								Browse vendors
							</Link>
						</div>
					</div>
				</div>
			</section>
			<section>
				<div className="container mx-auto py-24 px-4">
					<div className="space-y-12">
						<div className="max-w-3xl mx-auto space-y-6 text-center">
							<h2 className="text-3xl md:text-6xl font-medium">
								<span>Ready to join the</span>{" "}
								<span className="text-primary">Movement?</span>
							</h2>
							<h3 className="text-3xl md:text-6xl font-medium">Here's How.</h3>
							<p className="text-lg">
								Whether you're a builder, architect, or sustainability advocate,
								EcobuiltConnect has something for you. Join us in transforming
								the construction industry!
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
