import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangleIcon, LifeBuoyIcon } from "lucide-react";
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

export const Route = createFileRoute("/(user)/user/checkout/error/")({
	head: () => ({
		meta: [
			{
				title: "Checkout Error",
			},
			{
				name: "description",
				content: "We could not complete your payment.",
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
							<AlertTriangleIcon className="size-5" />
						</EmptyMedia>
						<EmptyTitle>We could not process your payment</EmptyTitle>
						<EmptyDescription>
							No charges were made. Please review your details and try again. If
							the issue persists, contact support and we will help you complete
							your order.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent className="max-w-md flex-row flex-wrap justify-center">
						<Link
							to="/contact"
							className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
						>
							<LifeBuoyIcon className="size-4" />
							Contact support
						</Link>
					</EmptyContent>
				</Empty>
			</div>
		</section>
	);
}
