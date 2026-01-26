import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Building2Icon, CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { AppPending } from "@/components/blocks/app-pending";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatMoneyFromCents } from "@/lib/formatters";
import { composeS3URL } from "@/lib/s3.shared";
import { getProduct } from "@/remote/public.product";
import { cartActions, cartStore } from "@/stores/cart";

export const Route = createFileRoute("/(public)/products/$productId/")({
	loader: ({ params }) => getProduct({ data: { productId: params.productId } }),
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.product.name}`,
			},
			{
				name: "description",
				content: `Buy ${loaderData?.product.name} on EcobuiltConnect. Sustainable construction materials and products.`,
			},
		],
	}),
	pendingComponent: AppPending,
	component: ProductDetailsPage,
});

function ProductDetailsPage() {
	const { product } = Route.useLoaderData();

	const quantites = useStore(cartStore, ({ items }) =>
		items.reduce<Record<string, number>>((acc, item) => {
			acc[item.productId] = item.quantity;

			return acc;
		}, {}),
	);

	const [currQuantity, setCurrQuantity] = useState(1);

	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28 flex gap-12 flex-col lg:flex-row">
				<Card className="w-full lg:w-1/2">
					<CardContent className="flex flex-col items-center justify-center">
						<Carousel className="w-full">
							<CarouselContent>
								{product.pictureKeys.map((key, index) => (
									<CarouselItem key={key}>
										<img
											className="aspect-square object-contain w-full"
											src={composeS3URL(key)}
											alt={`${product.name} - View ${index + 1}`}
										/>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4" />
							<CarouselNext className="right-4" />
						</Carousel>
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
								<p className="font-medium text-muted-foreground">
									{product.sku}
								</p>
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
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									if (currQuantity > 1) {
										setCurrQuantity(currQuantity - 1);
									}
								}}
								disabled={currQuantity <= 1}
							>
								<MinusIcon className="size-4" />
							</Button>
							<Input
								type="number"
								min="1"
								value={currQuantity}
								onChange={(event) => {
									if (
										event.target.valueAsNumber >= 1 &&
										event.target.valueAsNumber + (quantites[product.id] ?? 0) <=
											product.stock
									) {
										setCurrQuantity(event.target.valueAsNumber);
									}
								}}
								disabled={product.stock < 1}
								className="w-20 text-center"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									if (
										currQuantity + (quantites[product.id] ?? 0) <
										product.stock
									) {
										setCurrQuantity(currQuantity + 1);
									}
								}}
								disabled={
									currQuantity + (quantites[product.id] ?? 0) >= product.stock
								}
							>
								<PlusIcon className="size-4" />
							</Button>
						</div>
						<Button
							size="lg"
							className="w-full"
							onClick={() =>
								cartActions.addItem({
									productId: product.id,
									quantity: currQuantity,
								})
							}
							disabled={
								currQuantity + (quantites[product.id] ?? 0) > product.stock
							}
						>
							{currQuantity + (quantites[product.id] ?? 0) > product.stock
								? "Out of stock"
								: "Add to Cart"}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
