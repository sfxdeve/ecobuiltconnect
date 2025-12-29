import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(public)")({
	pendingComponent: AppPending,
	component: PublicLayout,
});

function PublicLayout() {
	return (
		<main className="relative">
			<AppHeader />
			<Outlet />
			<AppFooter />
		</main>
	);
}
