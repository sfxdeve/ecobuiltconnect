import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(public)")({
	component: PublicLayout,
	pendingComponent: AppPending,
});

function PublicLayout() {
	return (
		<main>
			<Outlet />
		</main>
	);
}
