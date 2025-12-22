import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)")({
	component: PublicLayout,
});

function PublicLayout() {
	return (
		<main className={"min-h-screen"}>
			<Outlet />
		</main>
	);
}
