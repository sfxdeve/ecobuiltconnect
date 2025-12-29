import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";
import { getClerkId } from "@/lib/api/clerk";

export const Route = createFileRoute("/(auth)")({
	beforeLoad: async () => {
		try {
			const { clerkId } = await getClerkId();

			if (clerkId) {
				throw redirect({ to: "/" });
			}
		} catch (error) {
			console.error(error);
		}
	},
	pendingComponent: AppPending,
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<>
			<AppHeader />
			<main>
				<section className="container mx-auto py-12 px-4">
					<div className="flex justify-center">
						<Outlet />
					</div>
				</section>
			</main>
			<AppFooter />
		</>
	);
}
