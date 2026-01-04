import { useUser } from "@clerk/tanstack-react-start";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "@tanstack/react-store";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getProduct } from "@/lib/api/public.product";
import { composeS3Url } from "@/lib/aws/shared.s3";
import { cartActions, cartStore } from "@/stores/cart";
import { cn } from "@/utils";
import { formatMoneyFromCents } from "@/utils/formatters";

export function AppHeaderCart() {
	const { isSignedIn } = useUser();

	const cartState = useStore(cartStore);

	const cartItemsCount = useStore(cartStore, ({ items }) =>
		items.reduce((sum, item) => sum + item.quantity, 0),
	);

	const getProductByIdFn = useServerFn(getProduct);

	const productResults = useQueries({
		queries: cartState.items.map((item) => ({
			queryKey: ["product", item.productId],
			queryFn: () => getProductByIdFn({ data: { productId: item.productId } }),
		})),
	});

	return (
		<Popover open={cartState.isOpen} onOpenChange={cartActions.setCartIsOpen}>
			<PopoverTrigger
				render={<Button variant="outline" size="icon" className="relative" />}
			>
				<ShoppingCartIcon className="size-4.5" />
				{cartItemsCount > 0 && (
					<Badge className="absolute -top-2 -right-2 size-5 text-[0.65rem]">
						{cartItemsCount}
					</Badge>
				)}
			</PopoverTrigger>
			<PopoverContent align="center" className="m-2">
				<PopoverHeader>
					<PopoverTitle>Shopping Cart</PopoverTitle>
				</PopoverHeader>
				<div className="space-y-4">
					{cartState.items.length > 0 ? (
						<>
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
									<div key={item.productId} className="flex gap-3">
										<img
											src={composeS3Url(product.pictureIds[0])}
											alt={product.name}
											className="size-16 rounded object-cover"
										/>
										<div className="flex-1 min-w-0">
											<h4 className="text-sm font-medium truncate">
												{product.name}
											</h4>
											<p className="text-sm text-muted-foreground">
												Qty: {item.quantity}
											</p>
											<p className="text-sm font-medium">
												{formatMoneyFromCents(
													(product.salePrice
														? product.salePrice
														: product.price) * item.quantity,
													{
														locale: "en-ZA",
														currency: "ZAR",
													},
												)}
											</p>
										</div>
										<Button
											onClick={() => cartActions.removeItem(item.productId)}
											variant="ghost"
											size="icon"
											className="size-8"
										>
											<Trash2Icon className="size-4" />
										</Button>
									</div>
								);
							})}
							<Separator />
							<div>
								<Link
									to={isSignedIn ? "/user/checkout" : "/sign-in/$"}
									onClick={() => {
										cartActions.toggleIsOpen();
									}}
									className={cn(
										buttonVariants({ variant: "default" }),
										"w-full",
									)}
								>
									Checkout
								</Link>
							</div>
						</>
					) : (
						<Empty className="bg-muted">
							<EmptyHeader>
								<EmptyTitle>Your cart is empty</EmptyTitle>
								<EmptyDescription>
									Add items to your cart to get started.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
