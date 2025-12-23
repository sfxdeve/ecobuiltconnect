import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublicProducts } from "@/server/public/products";

export const Route = createFileRoute("/(public)/products/")({
	validateSearch: z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		name: z.string().optional(),
		description: z.string().optional(),
		previousUsage: z.string().optional(),
		sku: z.string().optional(),
		minStock: z.number().optional(),
		minPrice: z.number().optional(),
		maxPrice: z.number().optional(),
		condition: z.enum(["EXCELLENT", "GOOD", "FAIR"]).optional(),
		isVerified: z.boolean().optional(),
		categoryId: z.string().optional(),
		vendorId: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({
		search,
	}),
	loader: ({ deps: { search } }) =>
		getPublicProducts({
			data: {
				...search,
			},
		}),
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
