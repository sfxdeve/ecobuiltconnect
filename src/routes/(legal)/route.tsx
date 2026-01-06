import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";

export const Route = createFileRoute("/(legal)")({
	component: LegalLayout,
});

function LegalLayout() {
	return (
		<main className="relative">
			<AppHeader />
			<Outlet />
			<AppFooter />
		</main>
	);
}
