import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getPublicProductById } from "@/server/public/products";
import { cartActions, cartStore } from "@/stores/cart";
import { Badge } from "../ui/badge";
import { Button, buttonVariants } from "../ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "../ui/empty";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";

export function AppCart() {
	const cartState = useStore(cartStore);

	const cartItemsCount = useStore(cartStore, ({ items }) =>
		items.reduce((sum, item) => sum + item.quantity, 0),
	);

	const productResults = useQueries({
		queries: cartState.items.map((item) => ({
			queryKey: ["product", item.productId],
			queryFn: () => getPublicProductById({ data: { id: item.productId } }),
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
			<PopoverContent align="end">
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
											src={product.pictureIds[0]}
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
												{formatMoney(
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
									to="/community"
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
								<EmptyDescription>Your cart is empty</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
