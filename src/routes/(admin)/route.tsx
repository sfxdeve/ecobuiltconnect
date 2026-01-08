import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/blocks/admin-sidebar";
import { AppFooter } from "@/components/blocks/app-footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getAdminProfile } from "@/remote/admin.profile";

export const Route = createFileRoute("/(admin)")({
	beforeLoad: async () => {
		try {
			await getAdminProfile();
		} catch {
			throw redirect({ to: "/" });
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<main className="w-full">
				<Outlet />
				<AppFooter />
			</main>
		</SidebarProvider>
	);
}
