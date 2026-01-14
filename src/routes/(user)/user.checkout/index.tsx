import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "@tanstack/react-store";
import { MapPinIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { AppPending } from "@/components/blocks/app-pending";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatMoneyFromCents } from "@/lib/formatters";
import { composeS3URL } from "@/lib/s3.shared";
import { getProduct } from "@/remote/public.product";
import { createOrderRequest } from "@/remote/user.order-request";
import { initiateOrderRequestPayment } from "@/remote/user.ozow";
import { getUserProfile } from "@/remote/user.profile";
import { cartActions, cartStore } from "@/stores/cart";

export const Route = createFileRoute("/(user)/user/checkout/")({
	head: () => ({
		meta: [
			{
				title: "Checkout",
			},
			{
				name: "description",
				content: "Secure checkout for your sustainable building supplies.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: CheckoutPage,
});

function CheckoutPage() {
	const { user } = useUser();

	const cartState = useStore(cartStore);

	const getUserProfileFn = useServerFn(getUserProfile);
	const getProductFn = useServerFn(getProduct);
	const createOrderFn = useServerFn(createOrderRequest);
	const initiateOrderRequestPaymentFn = useServerFn(
		initiateOrderRequestPayment,
	);

	const userProfileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["user-profile", user?.id],
		queryFn: () => getUserProfileFn(),
	});

	const productsResults = useQueries({
		queries: cartState.items.map((item) => ({
			queryKey: ["product", item.productId],
			queryFn: () => getProductFn({ data: { productId: item.productId } }),
		})),
	});

	const createUserOrderMutation = useMutation({
		mutationFn: (items: typeof cartState.items) =>
			createOrderFn({ data: { items } }),
		onSuccess: async ({ orderRequest }) => {
			const { redirectUrl } = await initiateOrderRequestPaymentFn({
				data: { orderRequestId: orderRequest.id },
			});

			cartActions.clearCart();

			location.assign(redirectUrl);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const cartTotal = cartState.items.reduce((acc, item, index) => {
		const product = productsResults[index].data?.product;

		if (!product) {
			return acc;
		}

		return acc + (product.salePrice ?? product.price) * item.quantity;
	}, 0);

	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28">
				{cartState.items.length > 0 ? (
					<div className="flex gap-4 items-start">
						<Card className="flex-1 hidden md:block">
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
												<img
													src={composeS3URL(product.pictureKeys[0])}
													alt={product.name}
												/>
											</ItemMedia>
											<ItemContent>
												<ItemTitle className="text-lg font-bold">
													{product.name}
												</ItemTitle>
												<ItemDescription>
													<span>Qty: {item.quantity}</span>
													<br />
													<span>
														{formatMoneyFromCents(
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
												{formatMoneyFromCents(cartTotal, {
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
											{(() => {
												if (userProfileResult.isPending) {
													return <Spinner />;
												}

												if (userProfileResult.isError) {
													return null;
												}

												return (
													<div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
														<span className="font-medium">Name:</span>
														<span>
															{userProfileResult.data.userProfile.name}
														</span>
														{user?.primaryEmailAddress != null && (
															<>
																<span className="font-medium">Email:</span>
																<span className="break-all">
																	{user.primaryEmailAddress.emailAddress}
																</span>
															</>
														)}
													</div>
												);
											})()}
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

												if (userProfileResult.isError) {
													return null;
												}

												return (
													<div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
														<span className="font-medium">Address:</span>
														<span className="break-all">
															{userProfileResult.data.userProfile.address}
														</span>
														<span className="font-medium">City:</span>
														<span>
															{userProfileResult.data.userProfile.city}
														</span>
														<span className="font-medium">Postal Code:</span>
														<span>
															{userProfileResult.data.userProfile.postcode}
														</span>
													</div>
												);
											})()}
										</ItemDescription>
									</ItemContent>
								</Item>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => {
										createUserOrderMutation.mutate(cartState.items);
									}}
									disabled={
										createUserOrderMutation.isPending ||
										cartState.items.length === 0
									}
									variant="default"
									size="lg"
									className="w-full"
								>
									{createUserOrderMutation.isPending
										? "Processing..."
										: "Confirm"}
								</Button>
							</CardFooter>
						</Card>
					</div>
				) : (
					<Empty className="bg-muted">
						<EmptyHeader>
							<EmptyTitle>Your cart is empty</EmptyTitle>
							<EmptyDescription>
								Add items to your cart to proceed with checkout.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</div>
		</section>
	);
}
