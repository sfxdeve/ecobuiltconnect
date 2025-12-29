import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppPending } from "@/components/blocks/app-pending";
import { VendorSidebar } from "@/components/blocks/vendor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(vendor)")({
	component: VendorLayout,
	pendingComponent: AppPending,
});

function VendorLayout() {
	return (
		<>
			<SidebarProvider>
				<VendorSidebar />
				<main>
					<Outlet />
				</main>
			</SidebarProvider>
			<AppFooter />
		</>
	);
}
