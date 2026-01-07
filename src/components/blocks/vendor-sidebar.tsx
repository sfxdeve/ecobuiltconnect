import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	FileTextIcon,
	type LucideIcon,
	PackageIcon,
	ShoppingBagIcon,
	// TagIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VendorProfileForm } from "@/components/forms/vendor-profile-form";
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
	useSidebar,
} from "@/components/ui/sidebar";
import {
	getVendorProfile,
	upsertVendorProfile,
} from "@/lib/api/vendor.profile";
import type { FileRouteTypes } from "@/routeTree.gen";

const items = [
	// {
	// 	icon: TagIcon,
	// 	label: "Categories",
	// 	to: "/vendor/categories",
	// },
	{
		icon: FileTextIcon,
		label: "Requests",
		to: "/vendor/requests",
	},
	{
		icon: PackageIcon,
		label: "Products",
		to: "/vendor/products",
	},
	{
		icon: ShoppingBagIcon,
		label: "Orders",
		to: "/vendor/orders",
	},
] satisfies {
	icon: LucideIcon;
	label: string;
	to: FileRouteTypes["to"];
}[];

export function VendorSidebar() {
	const { user } = useUser();

	const [isUpsertVendorProfileDialogOpen, setIsUpsertVendorProfileDialogOpen] =
		useState(false);

	const getVendorProfileFn = useServerFn(getVendorProfile);
	const upsertVendorProfileFn = useServerFn(upsertVendorProfile);

	const queryClient = useQueryClient();

	const vendorProfileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["vendor-profile", user?.id],
		queryFn: () => getVendorProfileFn(),
	});

	const upsertVendorProfileMutation = useMutation({
		mutationFn: upsertVendorProfileFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["vendor-profile", user?.id],
			});

			setIsUpsertVendorProfileDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { setOpenMobile } = useSidebar();

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
								onClick={() => {
									setOpenMobile(false);
								}}
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
						open={isUpsertVendorProfileDialogOpen}
						onOpenChange={setIsUpsertVendorProfileDialogOpen}
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
							<VendorProfileForm
								defaultValues={{
									pictureKeys:
										vendorProfileResult.data?.vendorProfile?.pictureKeys ?? [],
									name: vendorProfileResult.data?.vendorProfile?.name ?? "",
									description:
										vendorProfileResult.data?.vendorProfile?.description ?? "",
									address:
										vendorProfileResult.data?.vendorProfile?.address ?? "",
									city: vendorProfileResult.data?.vendorProfile?.city ?? "",
									postcode:
										vendorProfileResult.data?.vendorProfile?.postcode ?? "",
								}}
								isSubmitting={upsertVendorProfileMutation.isPending}
								submitHandler={upsertVendorProfileMutation.mutate}
							/>
						</DialogContent>
					</Dialog>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
