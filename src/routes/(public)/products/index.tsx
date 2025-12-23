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
import { getPuclicProducts } from "@/server/public/products";

export const Route = createFileRoute("/(public)/products/")({
	loader: () => getPuclicProducts(),
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
	const { products } = Route.useLoaderData();

	return (
		<section className="container mx-auto py-12 px-4 space-y-6">
			<div>
				<Input placeholder="Search Products" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{products.map((product) => (
					<Card key={product.id} className="relative">
						{product.isVerified && (
							<Badge className="absolute top-4 right-4">EcobuiltConnect</Badge>
						)}
						<CardHeader>
							<img
								className="aspect-square object-contain"
								src={product.pictureIds[0]}
								alt={product.name}
							/>
						</CardHeader>
						<CardContent>
							<h3 className="font-semibold text-primary text-xs uppercase">
								{product.vendor.clerkId}
							</h3>
							<h2 className="font-semibold text-xl">{product.name}</h2>
						</CardContent>
						<CardFooter className="flex justify-between items-center">
							<div className="flex flex-col">
								<span className="font-bold text-xl">
									{product.salePrice
										? `$${product.salePrice.toFixed(2)}`
										: `$${product.price.toFixed(2)}`}
								</span>
								<span className="text-xs">Excl. VAT</span>
							</div>
							<Button variant="default" size="lg">
								Purchase
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</section>
	);
}
