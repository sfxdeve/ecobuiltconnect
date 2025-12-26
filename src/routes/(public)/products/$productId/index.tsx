import { createFileRoute } from "@tanstack/react-router";
import { Building2Icon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoneyFromCents } from "@/lib/formatters";
import { getProductById } from "@/server/public/products";
import { cartActions } from "@/stores/cart";

export const Route = createFileRoute("/(public)/products/$productId/")({
	loader: ({ params }) => getProductById({ data: { id: params.productId } }),
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.product.name} - EcobuiltConnect`,
			},
			{
				name: "description",
				content: loaderData?.product.description,
			},
		],
	}),
	component: ProductDetailsPage,
});

function ProductDetailsPage() {
	const { product } = Route.useLoaderData();

	return (
		<section className="container mx-auto py-12 px-4 flex gap-12 flex-col lg:flex-row">
			<Card className="w-full lg:w-1/2">
				<CardContent className="flex flex-col items-center justify-center">
					<img
						className="aspect-square object-contain"
						src={product.pictureIds[0]}
						alt={product.name}
					/>
				</CardContent>
			</Card>
			<div className="flex-1 space-y-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{product.category.name}</Badge>
						{product.isVerified && (
							<Badge className="gap-1">
								<CheckIcon className="size-3" />
								EcobuiltConnect Verified
							</Badge>
						)}
					</div>
					<h3 className="text-4xl font-bold tracking-tight lg:text-5xl">
						{product.name}
					</h3>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Building2Icon className="size-4" />
						<span className="text-sm font-medium">
							{product.vendorProfile.name}
						</span>
					</div>
				</div>
				<div>
					<div className="flex items-baseline gap-1">
						<span className="text-3xl font-bold">
							{formatMoneyFromCents(product.price, {
								locale: "en-ZA",
								currency: "ZAR",
							})}
						</span>
					</div>
					<p className="text-sm text-muted-foreground mt-1">Excl. VAT</p>
				</div>
				<Separator />
				<div className="space-y-6">
					<div className="space-y-2">
						<h3 className="text-xl font-bold">Product Details</h3>
						<p className="text-lg text-muted-foreground leading-relaxed">
							{product.description}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-y-6 gap-x-8">
						<div className="space-y-1">
							<p className="text-sm font-medium">Condition</p>
							<p className="font-medium capitalize text-muted-foreground">
								{product.condition.toLowerCase()}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">SKU</p>
							<p className="font-medium text-muted-foreground">{product.sku}</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">Availability</p>
							<p className="text-green-600 font-medium">
								{product.stock} in stock
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">Previous Usage</p>
							<p className="font-medium text-muted-foreground ">
								{product.previousUsage}
							</p>
						</div>
					</div>
				</div>
				<Separator />
				<Button
					size="lg"
					className="w-full"
					onClick={() => cartActions.addItem({ productId: product.id })}
				>
					Add to Cart
				</Button>
			</div>
		</section>
	);
}
