import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(auth)")({
	component: AuthLayout,
	pendingComponent: AppPending,
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
