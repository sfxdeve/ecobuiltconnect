import { debounce } from "@tanstack/pacer";
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
import { formatMoney } from "@/lib/formatters";
import { getPublicProducts } from "@/server/public/products";

export const Route = createFileRoute("/(public)/products/")({
	validateSearch: z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc"),
		searchTerm: z.string().optional(),
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
			{
				name: "description",
				content:
					"Browse our collection of sustainable and eco-friendly products on EcobuiltConnect.",
			},
		],
	}),
	component: ProductsPage,
});

function ProductsPage() {
	const loaderData = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const debouncedSearch = debounce(
		(searchTerm: string) => {
			navigate({
				search: (prev) => ({
					...prev,
					page: 1,
					searchTerm: searchTerm.trim() ? searchTerm : undefined,
				}),
				replace: true,
			});
		},
		{ wait: 500 },
	);

	return (
		<section className="container mx-auto py-12 px-4 space-y-6">
			<div>
				<Input
					placeholder="Search Products"
					defaultValue={search.searchTerm ?? ""}
					onChange={(event) => debouncedSearch(event.target.value)}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{loaderData.products.map((product) => (
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
									{formatMoney(
										product.salePrice ? product.salePrice : product.price,
										{
											locale: "en-ZA",
											currency: "ZAR",
										},
									)}
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
