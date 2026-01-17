import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBagIcon, XCircleIcon } from "lucide-react";
import { AppPending } from "@/components/blocks/app-pending";
import { buttonVariants } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(user)/user/checkout/cancelled/")({
	head: () => ({
		meta: [
			{
				title: "Checkout Cancelled",
			},
			{
				name: "description",
				content: "Your checkout was cancelled.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28">
				<Empty className="bg-muted">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<XCircleIcon className="size-5" />
						</EmptyMedia>
						<EmptyTitle>Checkout cancelled</EmptyTitle>
						<EmptyDescription>
							You have not been charged and your cart items are cleared. When
							you are ready, you can return to continue browsing the
							marketplace.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent className="max-w-md flex-row flex-wrap justify-center">
						<Link
							to="/products"
							className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
						>
							<ShoppingBagIcon className="size-4" />
							Continue shopping
						</Link>
					</EmptyContent>
				</Empty>
			</div>
		</section>
	);
}
