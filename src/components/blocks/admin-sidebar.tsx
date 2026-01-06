import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	type LucideIcon,
	PackageIcon,
	ShoppingBagIcon,
	TagIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminProfileForm } from "@/components/forms/admin-profile-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getAdminProfile, upsertAdminProfile } from "@/lib/api/admin.profile";
import type { FileRouteTypes } from "@/routeTree.gen";

const items: {
	icon: LucideIcon;
	label: string;
	to: FileRouteTypes["to"];
}[] = [
	{
		icon: TagIcon,
		label: "Categories",
		to: "/admin/categories",
	},
	{
		icon: PackageIcon,
		label: "Products",
		to: "/admin/products",
	},
	{
		icon: ShoppingBagIcon,
		label: "Orders",
		to: "/admin/orders",
	},
	{
		icon: ShoppingBagIcon,
		label: "Vendors",
		to: "/admin/vendors",
	},
];

export function AdminSidebar() {
	const { user } = useUser();

	const [isUpsertAdminProfileDialogOpen, setIsUpsertAdminProfileDialogOpen] =
		useState(false);

	const getAdminProfileFn = useServerFn(getAdminProfile);
	const upsertAdminProfileFn = useServerFn(upsertAdminProfile);

	const queryClient = useQueryClient();

	const adminProfileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["admin-profile", user?.id],
		queryFn: () => getAdminProfileFn(),
	});

	const upsertAdminProfileMutation = useMutation({
		mutationFn: upsertAdminProfileFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["admin-profile", user?.id],
			});

			setIsUpsertAdminProfileDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<Sidebar>
			<SidebarHeader>
				<img className="h-24 mx-auto" src="/logo-512x512.png" alt="Logo" />
			</SidebarHeader>
			<SidebarContent className="p-2">
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.to}>
							<SidebarMenuButton
								render={
									<Link to={item.to} activeProps={{ className: "bg-muted" }} />
								}
							>
								<item.icon />
								<span>{item.label}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<Dialog
						open={isUpsertAdminProfileDialogOpen}
						onOpenChange={setIsUpsertAdminProfileDialogOpen}
					>
						<SidebarMenuItem>
							<SidebarMenuButton render={<DialogTrigger />}>
								<UserIcon />
								<span>Profile</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-xl font-semibold">
									Profile
								</DialogTitle>
							</DialogHeader>
							<AdminProfileForm
								defaultValues={{
									name: adminProfileResult.data?.adminProfile?.name ?? "",
									description:
										adminProfileResult.data?.adminProfile?.description ?? "",
								}}
								isSubmitting={upsertAdminProfileMutation.isPending}
								submitHandler={upsertAdminProfileMutation.mutate}
							/>
						</DialogContent>
					</Dialog>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
