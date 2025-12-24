import { useUser } from "@clerk/tanstack-react-start";
import { useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "@tanstack/react-store";
import { MapPinIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import { getUserProfileServerFn } from "@/server/user/profile";
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
	const { isSignedIn, user } = useUser();

	const cartState = useStore(cartStore);

	const getUserProfile = useServerFn(getUserProfileServerFn);

	const userProfileResult = useQuery({
		queryKey: ["profile", user?.id],
		queryFn: () => getUserProfile(),
	});

	const getPublicProductById = useServerFn(getPublicProductByIdServerFn);

	const productsResults = useQueries({
		queries: cartState.items.map((item) => ({
			queryKey: ["product", item.productId],
			queryFn: () => getPublicProductById({ data: { id: item.productId } }),
		})),
	});

	const cartTotal = cartState.items.reduce((acc, item, index) => {
		const product = productsResults[index].data?.product;

		if (!product) {
			return acc;
		}

		return acc + (product.salePrice ?? product.price) * item.quantity;
	}, 0);

	if (!isSignedIn) {
		return;
	}

	return (
		<section className="container mx-auto py-12 px-4">
			{cartState.items.length > 0 ? (
				<div className="flex gap-4 items-start">
					<Card className="flex-1">
						<CardHeader>
							<CardTitle className="text-3xl">Cart Items</CardTitle>
							<CardDescription className="text-base">
								Review your cart before checkout
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{cartState.items.map((item, index) => {
								const result = productsResults[index];

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
											<ItemDescription>
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
							<Item
								variant="muted"
								className="justify-between text-lg font-bold"
							>
								<ItemContent>
									<ItemTitle className="w-full flex justify-between text-xl font-semibold">
										<span>Total</span>
										<span>
											{formatMoney(cartTotal, {
												locale: "en-ZA",
												currency: "ZAR",
											})}
										</span>
									</ItemTitle>
								</ItemContent>
							</Item>
						</CardContent>
					</Card>
					<Card className="flex-1">
						<CardHeader>
							<CardTitle className="text-3xl">Customer Information</CardTitle>
							<CardDescription className="text-base">
								Review your information before checkout
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Item variant="muted" className="flex gap-3">
								<ItemMedia variant="icon">
									<UserIcon className="size-6" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-lg font-bold">
										Personal Details
									</ItemTitle>
									<ItemDescription>
										<div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
											<span className="font-medium">Name:</span>
											<span>{user.fullName}</span>
											<span className="font-medium">Email:</span>
											<span className="break-all">
												{user.primaryEmailAddress?.emailAddress}
											</span>
										</div>
									</ItemDescription>
								</ItemContent>
							</Item>
							<Item variant="muted" className="flex gap-3">
								<ItemMedia variant="icon">
									<MapPinIcon className="size-5" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-lg font-bold">
										Address Details
									</ItemTitle>
									<ItemDescription>
										{(() => {
											if (userProfileResult.isPending) {
												return <Spinner />;
											}

											if (!userProfileResult.data?.profile) {
												return null;
											}

											const profile = userProfileResult.data.profile;

											return (
												<div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
													<span className="font-medium">Address:</span>
													<span className="break-all">{profile.address}</span>
													<span className="font-medium">City:</span>
													<span>{profile.city}</span>
													<span className="font-medium">Postal Code:</span>
													<span>{profile.postcode}</span>
												</div>
											);
										})()}
									</ItemDescription>
								</ItemContent>
							</Item>
							<Separator />
						</CardContent>
						<CardFooter>
							<Button variant="default" size="lg" className="w-full">
								Confirm Order
							</Button>
						</CardFooter>
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
