import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";
import { getUserProfile } from "@/lib/api/user.profile";

export const Route = createFileRoute("/(user)")({
	beforeLoad: async () => {
		try {
			await getUserProfile();
		} catch (_error) {
			throw redirect({ to: "/" });
		}
	},
	pendingComponent: AppPending,
	component: UserLayout,
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
