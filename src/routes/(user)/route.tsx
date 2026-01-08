import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { getUserProfile } from "@/remote/user.profile";

export const Route = createFileRoute("/(user)")({
	beforeLoad: async () => {
		try {
			await getUserProfile();
		} catch {
			throw redirect({ to: "/" });
		}
	},
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
