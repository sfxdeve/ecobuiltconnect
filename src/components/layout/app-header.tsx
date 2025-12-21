import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader() {
	return (
		<header
			className={"container mx-auto flex items-center justify-between py-4"}
		>
			{/* Logo */}
			<div>
				<h1>EcobuiltConnect</h1>
			</div>
			{/* Links */}
			<div>
				<ul className={"flex gap-4 items-center"}>
					<li>
						<Link
							className={cn(
								"",
								buttonVariants({ variant: "ghost", size: "lg" }),
							)}
							to="/"
						>
							Home
						</Link>
					</li>
					<li>
						<Link
							className={cn(
								"",
								buttonVariants({ variant: "ghost", size: "lg" }),
							)}
							to="/products"
						>
							Marketplace
						</Link>
					</li>
					<li>
						<Link
							className={cn(
								"",
								buttonVariants({ variant: "ghost", size: "lg" }),
							)}
							to="/vendors"
						>
							Vendors
						</Link>
					</li>
					<li>
						<Link
							className={cn(
								"",
								buttonVariants({ variant: "ghost", size: "lg" }),
							)}
							to="/community"
						>
							Community
						</Link>
					</li>
					<li>
						<Link
							className={cn(
								"",
								buttonVariants({ variant: "ghost", size: "lg" }),
							)}
							to="/contact"
						>
							Contact
						</Link>
					</li>
				</ul>
			</div>
			{/* Actions */}
			<div>
				<SignedIn>
					<UserButton />
				</SignedIn>
				<SignedOut>
					<SignInButton />
				</SignedOut>
			</div>
		</header>
	);
}
