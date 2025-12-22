import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(public)/products/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Products",
			},
		],
	}),
	component: ProductsPage,
});

function ProductsPage() {
	return (
		<section className={"container mx-auto py-12 px-4 space-y-6"}>
			<div>
				<Input placeholder="Search Products" />
			</div>
			<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
				<ProductCard />
				<ProductCard />
				<ProductCard />
				<ProductCard />
				<ProductCard />
			</div>
		</section>
	);
}

function ProductCard() {
	return (
		<Card className={"relative"}>
			<Badge className="absolute top-4 right-4">EcobuiltConnect</Badge>
			<CardHeader>
				<img
					className="aspect-square object-contain"
					src="/test.jpg"
					alt="Wooden Stable Door"
				/>
			</CardHeader>
			<CardContent>
				<h3 className={"font-semibold text-primary text-xs uppercase"}>
					EcobuiltConnect Store
				</h3>
				<h2 className={"font-semibold text-xl"}>Wooden Stable Door</h2>
			</CardContent>
			<CardFooter className={"flex justify-between items-center"}>
				<div className={"flex flex-col"}>
					<span className={"font-bold text-xl"}>$19.99</span>
					<span className={"text-xs"}>Excl. VAT</span>
				</div>
				<Button variant={"default"} size={"lg"}>
					Purchase
				</Button>
			</CardFooter>
		</Card>
	);
}
