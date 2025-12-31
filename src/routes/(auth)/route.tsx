import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { getClerkId } from "@/lib/api/shared.clerk";

export const Route = createFileRoute("/(auth)")({
	beforeLoad: async () => {
		try {
			const { clerkId } = await getClerkId();

			if (clerkId) {
				throw redirect({ to: "/" });
			}
		} catch (_error) {}
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<main className="relative">
			<AppHeader />
			<section className="container mx-auto py-12 px-4 pt-28">
				<div className="flex justify-center">
					<Outlet />
				</div>
			</section>
			<AppFooter />
		</main>
	);
}
