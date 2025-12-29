import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(user)")({
	component: UserLayout,
	pendingComponent: AppPending,
});

function UserLayout() {
	return (
		<>
			<AppHeader />
			<main>
				<Outlet />
			</main>
			<AppFooter />
		</>
	);
}
