import { Link } from "@tanstack/react-router";
import {
	FacebookIcon,
	InstagramIcon,
	type LucideIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	TwitterIcon,
	YoutubeIcon,
} from "lucide-react";
import type { FileRouteTypes } from "@/routeTree.gen";

const SOCIAL_LINKS = [
	{ icon: FacebookIcon, href: "https://facebook.com" },
	{ icon: InstagramIcon, href: "https://instagram.com" },
	{ icon: YoutubeIcon, href: "https://youtube.com" },
	{ icon: TwitterIcon, href: "https://twitter.com" },
] satisfies {
	icon: LucideIcon;
	href: string;
}[];

const QUICK_LINKS = [
	{ label: "Home", to: "/" },
	{ label: "Marketplace", to: "/products" },
	{ label: "Vendors", to: "/vendors" },
	{ label: "Community", to: "/community" },
	{ label: "Contact", to: "/contact" },
] satisfies {
	label: string;
	to: FileRouteTypes["to"];
}[];

const LEGAL_LINKS = [
	{ label: "Privacy Policy", to: "/privacy-policy" },
	{ label: "Cookies Policy", to: "/cookies-policy" },
	{ label: "Terms of Use", to: "/terms-of-use" },
	{ label: "Terms of Sale", to: "/terms-of-sales" },
	{ label: "Returns & Refunds Policy", to: "/returns-policy" },
] satisfies {
	label: string;
	to: FileRouteTypes["to"];
}[];

export function AppFooter() {
	return (
		<footer className="bg-primary/2.5">
			<div className="container mx-auto px-4 py-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				<div className="flex flex-col items-center space-y-4 text-center">
					<img
						src="/logo-512x512.png"
						alt="EcoBuilt Connect"
						className="h-24"
					/>
					<p className="text-muted-foreground max-w-xs text-sm">
						Connect with trusted vendors and contractors to reduce waste, cut
						costs and contribute to a greener future.
					</p>
					<div className="text-muted-foreground flex items-center justify-center gap-4">
						{SOCIAL_LINKS.map(({ icon: Icon, href }) => (
							<a
								key={href}
								href={href}
								target="_blank"
								rel="noreferrer"
								className="hover:text-primary transition-colors"
							>
								<Icon className="size-5" />
							</a>
						))}
					</div>
				</div>
				<div className="flex flex-col items-start lg:pl-8">
					<h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
					<ul className="text-muted-foreground space-y-4 text-sm">
						{QUICK_LINKS.map((link) => (
							<li key={link.label}>
								<Link
									to={link.to}
									className="hover:text-primary transition-colors"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="flex flex-col items-start">
					<h3 className="mb-6 text-lg font-semibold">Legal</h3>
					<ul className="text-muted-foreground space-y-4 text-sm">
						{LEGAL_LINKS.map((link) => (
							<li key={link.label}>
								<Link
									to={link.to}
									className="hover:text-primary transition-colors"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="flex flex-col items-start">
					<h3 className="mb-6 text-lg font-semibold">Contact Us</h3>
					<ul className="text-muted-foreground space-y-4 text-sm">
						<li className="flex items-center gap-3">
							<PhoneIcon className="text-primary size-4" />
							<span>+27681053549</span>
						</li>
						<li className="flex items-center gap-3">
							<MailIcon className="text-primary size-4" />
							<a
								href="mailto:support@ecobuiltconnect.co.za"
								className="hover:text-primary transition-colors"
							>
								support@ecobuiltconnect.co.za
							</a>
						</li>
						<li className="flex items-center gap-3">
							<MapPinIcon className="text-primary size-4.5" />
							<span>Goodwood, Cape Town</span>
						</li>
					</ul>
				</div>
			</div>
			<div className="bg-primary py-4">
				<p className="text-center text-sm text-white">
					Copyright © {new Date().getFullYear()} EcobuiltConnect. All rights
					reserved. Privacy Policy | Terms of Service
				</p>
			</div>
		</footer>
	);
}
