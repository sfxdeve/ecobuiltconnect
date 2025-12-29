import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
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
import { getVendorProfile, upsertVendorProfile } from "@/server/vendor/profile";
import {
	VendorProfileForm,
	type vendorProfileFormSchema,
} from "../forms/vendor-profile-form";
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
		label: "Orders",
		href: "/vendor/orders",
	},
	{
		label: "Requests",
		href: "/vendor/requests",
	},
	{
		label: "Products",
		href: "/vendor/products",
	},
] satisfies {
	label: string;
	href: FileRouteTypes["to"];
}[];

export function VendorSidebar() {
	const { user } = useUser();

	const [isUpsertVendorProfileDialogOpen, setIsUpsertVendorProfileDialogOpen] =
		useState(false);

	const getVendorProfileFn = useServerFn(getVendorProfile);
	const upsertVendorProfileFn = useServerFn(upsertVendorProfile);

	const queryClient = useQueryClient();

	const vendorProfileResult = useQuery({
		queryKey: ["vendor", "profile", user?.id],
		queryFn: () => getVendorProfileFn(),
	});

	const upsertVendorProfileMutation = useMutation({
		mutationFn: (data: z.infer<typeof vendorProfileFormSchema>) =>
			upsertVendorProfileFn({ data }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["vendor", "profile", user?.id],
			});

			setIsUpsertVendorProfileDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

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
					<Dialog
						open={isUpsertVendorProfileDialogOpen}
						onOpenChange={setIsUpsertVendorProfileDialogOpen}
					>
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
							<VendorProfileForm
								defaultValues={{
									pictureId:
										vendorProfileResult.data?.vendorProfile?.pictureId ??
										"/test.jpg",
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
								submitHandler={(data) => {
									upsertVendorProfileMutation.mutate(data);
								}}
							/>
						</DialogContent>
					</Dialog>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
