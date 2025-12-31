import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/blocks/app-footer";
import { VendorSidebar } from "@/components/blocks/vendor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getVendorProfile } from "@/lib/api/vendor.profile";

export const Route = createFileRoute("/(vendor)")({
	beforeLoad: async () => {
		try {
			await getVendorProfile();
		} catch (_error) {
			throw redirect({ to: "/" });
		}
	},
	component: VendorLayout,
});

function VendorLayout() {
	return (
		<SidebarProvider>
			<VendorSidebar />
			<main className="w-full">
				<Outlet />
				<AppFooter />
			</main>
		</SidebarProvider>
	);
}
