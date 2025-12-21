import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCartIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader() {
	const location = useLocation();

	return (
		<header
			className={"container mx-auto flex items-center justify-between py-4"}
		>
			{/* Logo */}
			<h1>EcobuiltConnect</h1>

			{/* Links */}
			<ul className={"flex gap-4 items-center"}>
				<li>
					<Link
						to="/"
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							location.pathname === "/" && "bg-muted",
						)}
					>
						Home
					</Link>
				</li>
				<li>
					<Link
						to="/products"
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							location.pathname === "/products" && "bg-muted",
						)}
					>
						Marketplace
					</Link>
				</li>
				<li>
					<Link
						to="/vendors"
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							location.pathname === "/vendors" && "bg-muted",
						)}
					>
						Vendors
					</Link>
				</li>
				<li>
					<Link
						to="/community"
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							location.pathname === "/community" && "bg-muted",
						)}
					>
						Community
					</Link>
				</li>
				<li>
					<Link
						to="/contact"
						className={cn(
							buttonVariants({ variant: "ghost", size: "lg" }),
							location.pathname === "/contact" && "bg-muted",
						)}
					>
						Contact
					</Link>
				</li>
			</ul>

			{/* Actions */}
			<div className={"flex items-center gap-4"}>
				<Button variant="outline" size="icon">
					<ShoppingCartIcon className="size-4.5" />
				</Button>
				<SignedIn>
					<UserButton />
				</SignedIn>
				<SignedOut>
					<div
						className={cn(buttonVariants({ variant: "default", size: "lg" }))}
					>
						<SignInButton />
					</div>
				</SignedOut>
			</div>
		</header>
	);
}
