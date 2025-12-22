import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<main>
			<section className="container mx-auto py-12 px-4">
				<div className="flex justify-center">
					<Outlet />
				</div>
			</section>
		</main>
	);
}
