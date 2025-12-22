import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { ShoppingCartIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AppHeader() {
	return (
		<header
			className={
				"container mx-auto px-4 flex items-center justify-between py-4"
			}
		>
			{/* Logo */}
			<img className={"size-18"} src="/logo.webp" alt="Logo" />

			{/* Links */}
			<ul className={"hidden md:flex lg:gap-4 gap-2 items-center"}>
				<li>
					<Link
						to="/"
						className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
						activeProps={{ className: "bg-muted" }}
					>
						Home
					</Link>
				</li>
				<li>
					<Link
						to="/products"
						className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
						activeProps={{ className: "bg-muted" }}
					>
						Marketplace
					</Link>
				</li>
				<li>
					<Link
						to="/vendors"
						className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
						activeProps={{ className: "bg-muted" }}
					>
						Vendors
					</Link>
				</li>
				<li>
					<Link
						to="/community"
						className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
						activeProps={{ className: "bg-muted" }}
					>
						Community
					</Link>
				</li>
				<li>
					<Link
						to="/contact"
						className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
						activeProps={{ className: "bg-muted" }}
					>
						Contact
					</Link>
				</li>
			</ul>

			{/* Actions */}
			<div className={"flex items-center gap-4"}>
				<Popover>
					<PopoverTrigger
						className={cn(
							buttonVariants({
								variant: "outline",
								size: "icon",
							}),
						)}
					>
						<ShoppingCartIcon className="size-4.5" />
					</PopoverTrigger>
					<PopoverContent align="end">
						<PopoverHeader>
							<PopoverTitle>Shopping Cart</PopoverTitle>
						</PopoverHeader>
					</PopoverContent>
				</Popover>
				<SignedIn>
					<UserButton
						appearance={{
							elements: {
								userButtonAvatarBox: "!size-9",
							},
						}}
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton mode="modal">
						<Button variant="default" size="lg">
							Sign In
						</Button>
					</SignInButton>
				</SignedOut>
			</div>
		</header>
	);
}
