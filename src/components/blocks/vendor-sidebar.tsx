import { Link } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { FileRouteTypes } from "@/routeTree.gen";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

const items = [
	{
		label: "Dashboard",
		href: "/vendor/dashboard",
	},
	{
		label: "Products",
		href: "/vendor/products",
	},
	{
		label: "Requests",
		href: "/vendor/requests",
	},
	{
		label: "Orders",
		href: "/vendor/orders",
	},
] satisfies {
	label: string;
	href: FileRouteTypes["to"];
}[];

export function VendorSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<img className="h-24 mx-auto" src="/logo-with-line.webp" alt="Logo" />
			</SidebarHeader>
			<SidebarContent className="p-2">
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								render={
									<Link
										to={item.href}
										activeProps={{ className: "bg-muted" }}
									/>
								}
							>
								{item.label}
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<Dialog>
						<SidebarMenuItem>
							<SidebarMenuButton render={<DialogTrigger />}>
								Profile
							</SidebarMenuButton>
						</SidebarMenuItem>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-xl font-semibold">
									Profile
								</DialogTitle>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
