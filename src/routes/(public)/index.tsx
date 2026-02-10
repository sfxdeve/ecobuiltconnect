import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	CreditCardIcon,
	type LucideIcon,
	ShoppingCartIcon,
	TruckIcon,
	User2Icon,
} from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { AppPending } from "@/components/blocks/app-pending";
import { buttonVariants } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemHeader,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

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
	const steps: {
		icon: LucideIcon;
		title: string;
		description: string;
	}[] = [
		{
			icon: ShoppingCartIcon,
			title: "Step 1",
			description:
				"Browse our marketplace and select the construction materials you need.",
		},
		{
			icon: CreditCardIcon,
			title: "Step 2",
			description: "Add items to your cart and proceed to checkout.",
		},
		{
			icon: User2Icon,
			title: "Step 3",
			description:
				"Sign in to your account and verify your credentials with OTP.",
		},
		{
			icon: TruckIcon,
			title: "Step 4",
			description:
				"Choose your delivery method, process payment, and you're done!",
		},
	];

	const testimonials: {
		image: string;
		name: string;
		message: string;
	}[] = [
		{
			image: "/face-01.webp",
			name: "Jack Reul",
			message:
				"Finally, a platform that makes finding quality recycled construction materials easy and reliable.",
		},
		{
			image: "/face-02.webp",
			name: "Jessy Iris",
			message:
				"EcobuiltConnect helped us cut material costs by 20% while staying eco-friendly — a game changer!",
		},
		{
			image: "/face-03.webp",
			name: "Mark Keller",
			message:
				"EcobuiltConnect bridges the gap between sustainability and affordability!",
		},
	];

	return (
		<>
			<section>
				<div className="container mx-auto py-12 px-4 pt-28 flex gap-12 flex-col-reverse md:flex-row items-center">
					<div className="flex-1 space-y-12">
						<div className="space-y-8">
							<h2 className="text-3xl md:text-5xl font-medium">
								<span>Buy quality used construction materials.</span>{" "}
								<span className="text-primary">
									Save 20-40% on every project.
								</span>
							</h2>
							<p className="text-lg">
								We help you turn surplus into revenue while reducing waste.
							</p>
						</div>
						<div className="flex gap-2 items-center">
							<Link
								to="/community"
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
								)}
							>
								Learn more
							</Link>
							<Link
								to="/products"
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
								to="/vendors"
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
				<div className="container mx-auto py-24 px-4 space-y-12">
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
					<div>
						<ItemGroup className="max-w-5xl mx-auto md:flex-row items-center justify-center">
							{steps.map((step, index) => (
								<Fragment key={step.title}>
									<Item variant="outline" className="w-48">
										<ItemHeader className="py-2 justify-center">
											<div className="p-5 rounded-full flex flex-col justify-center items-center bg-primary text-white">
												<step.icon className="size-8" />
											</div>
										</ItemHeader>
										<ItemContent>
											<ItemTitle className="w-full justify-center">
												{step.title}
											</ItemTitle>
											<ItemDescription className="line-clamp-none text-center">
												{step.description}
											</ItemDescription>
										</ItemContent>
									</Item>
									{index !== steps.length - 1 && (
										<>
											<ArrowRightIcon className="size-8 hidden md:block" />
											<ArrowDownIcon className="size-8 md:hidden" />
										</>
									)}
								</Fragment>
							))}
						</ItemGroup>
					</div>
				</div>
			</section>
			<section>
				<div className="container mx-auto pt-12 pb-24 px-4 space-y-12">
					<div className="space-y-12">
						<div className="max-w-3xl mx-auto space-y-6 text-center">
							<h2 className="text-3xl md:text-6xl font-medium">
								<span>Hear from Our</span>{" "}
								<span className="text-primary">Satisfied Customers!</span>
							</h2>
							<p className="text-lg">
								See what builders, architects, and sustainability champions are
								saying about EcobuiltConnect!
							</p>
						</div>
					</div>
					<div>
						<ItemGroup className="max-w-5xl mx-auto md:flex-row items-center justify-center">
							{testimonials.map((testimonial) => (
								<Item key={testimonial.name} variant="outline">
									<ItemMedia variant="image">
										<img src={testimonial.image} alt={testimonial.name} />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>{testimonial.name}</ItemTitle>
										<ItemDescription className="line-clamp-none">
											{testimonial.message}
										</ItemDescription>
									</ItemContent>
								</Item>
							))}
						</ItemGroup>
					</div>
				</div>
			</section>
		</>
	);
}
