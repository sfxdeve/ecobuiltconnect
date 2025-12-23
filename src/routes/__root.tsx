import { ClerkProvider } from "@clerk/tanstack-react-start";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import appCss from "@/styles.css?url";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "EcobuiltConnect",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: () => {
		return (
			<main>
				<section className="container mx-auto py-12 px-4"></section>
			</main>
		);
	},
	pendingComponent: () => {
		return (
			<main>
				<section className="container mx-auto py-12 px-4"></section>
			</main>
		);
	},
	errorComponent: () => {
		return (
			<main>
				<section className="container mx-auto py-12 px-4"></section>
			</main>
		);
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					<AppHeader />
					{children}
					<AppFooter />
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
