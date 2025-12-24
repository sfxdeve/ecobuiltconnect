import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "@tanstack/react-store";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/formatters";
import { getPublicProductByIdServerFn } from "@/server/public/products";
import { cartStore } from "@/stores/cart";

export const Route = createFileRoute("/(user)/checkout/")({
	head: () => ({
		meta: [
			{
				title: "EcobuiltConnect - Checkout",
			},
		],
	}),
	component: CheckoutPage,
});

function CheckoutPage() {
	const cartState = useStore(cartStore);

	const getPublicProductById = useServerFn(getPublicProductByIdServerFn);

	const productResults = useQueries({
		queries: cartState.items.map((item) => ({
			queryKey: ["product", item.productId],
			queryFn: () => getPublicProductById({ data: { id: item.productId } }),
		})),
	});

	return (
		<section className="container mx-auto py-12 px-4">
			{cartState.items.length > 0 ? (
				<div className="flex gap-4">
					<Card className="flex-1">
						<CardHeader>
							<CardTitle className="text-3xl">Cart Items</CardTitle>
							<CardDescription className="text-base">
								Review your cart before checkout
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{cartState.items.map((item, index) => {
								const result = productResults[index];

								if (result.isPending) {
									return <Spinner />;
								}

								if (!result.data?.product) {
									return null;
								}

								const product = result.data.product;

								return (
									<Item
										key={item.productId}
										variant="muted"
										className="flex gap-3"
									>
										<ItemMedia variant="image" className="size-20">
											<img src={product.pictureIds[0]} alt={product.name} />
										</ItemMedia>
										<ItemContent>
											<ItemTitle className="text-lg font-bold">
												{product.name}
											</ItemTitle>
											<ItemDescription className="">
												<span>Qty: {item.quantity}</span>
												<br />
												<span>
													{formatMoney(
														(product.salePrice
															? product.salePrice
															: product.price) * item.quantity,
														{
															locale: "en-ZA",
															currency: "ZAR",
														},
													)}
												</span>
											</ItemDescription>
										</ItemContent>
									</Item>
								);
							})}
							<Separator />
						</CardContent>
					</Card>
					<Card className="flex-1">
						<CardHeader>
							<CardTitle className="text-3xl">Delivery Information</CardTitle>
							<CardDescription className="text-base">
								Review your delivery information before checkout
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{cartState.items.map((item, index) => {
								const result = productResults[index];

								if (result.isPending) {
									return <Spinner />;
								}

								if (!result.data?.product) {
									return null;
								}

								const product = result.data.product;

								return (
									<Item
										key={item.productId}
										variant="muted"
										className="flex gap-3"
									>
										<ItemMedia variant="image" className="size-20">
											<img src={product.pictureIds[0]} alt={product.name} />
										</ItemMedia>
										<ItemContent>
											<ItemTitle className="text-lg font-bold">
												{product.name}
											</ItemTitle>
											<ItemDescription className="">
												<span>Qty: {item.quantity}</span>
												<br />
												<span>
													{formatMoney(
														(product.salePrice
															? product.salePrice
															: product.price) * item.quantity,
														{
															locale: "en-ZA",
															currency: "ZAR",
														},
													)}
												</span>
											</ItemDescription>
										</ItemContent>
									</Item>
								);
							})}
							<Separator />
						</CardContent>
					</Card>
				</div>
			) : (
				<Empty className="bg-muted">
					<EmptyHeader>
						<EmptyDescription>Your cart is empty</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</section>
	);
}
