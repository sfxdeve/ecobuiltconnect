import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	FileTextIcon,
	LandmarkIcon,
	LayoutDashboardIcon,
	type LucideIcon,
	PackageIcon,
	ShoppingBagIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { VendorAccountForm } from "@/components/forms/vendor-account-form";
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
	getBankAccount,
	upsertBankAccount,
} from "@/remote/vendor.bank-account";
import { getVendorProfile, upsertVendorProfile } from "@/remote/vendor.profile";
import type { FileRouteTypes } from "@/routeTree.gen";

const items = [
	{
		icon: LayoutDashboardIcon,
		label: "Dashboard",
		to: "/vendor/dashboard",
	},
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
	{
		icon: UsersIcon,
		label: "Users",
		to: "/vendor/users",
	},
] satisfies {
	icon: LucideIcon;
	label: string;
	to: FileRouteTypes["to"];
}[];

export function VendorSidebar() {
	const { user } = useUser();

	const [isUpsertBankAccountDialogOpen, setIsUpsertBankAccountDialogOpen] =
		useState(false);
	const [isUpsertVendorProfileDialogOpen, setIsUpsertVendorProfileDialogOpen] =
		useState(false);

	const getBankAccountFn = useServerFn(getBankAccount);
	const upsertBankAccountFn = useServerFn(upsertBankAccount);
	const getVendorProfileFn = useServerFn(getVendorProfile);
	const upsertVendorProfileFn = useServerFn(upsertVendorProfile);

	const queryClient = useQueryClient();

	const bankAccountResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["bank-account", user?.id],
		queryFn: () => getBankAccountFn(),
	});

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

	const upsertBankAccountMutation = useMutation({
		mutationFn: upsertBankAccountFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["bank-account", user?.id],
			});

			setIsUpsertBankAccountDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { setOpenMobile } = useSidebar();

	return (
		<Sidebar>
			<SidebarHeader>
				<Link to="/" aria-label="Go to home">
					<img className="h-24 mx-auto" src="/logo-512x512.png" alt="Logo" />
				</Link>
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
					<Dialog
						open={isUpsertBankAccountDialogOpen}
						onOpenChange={setIsUpsertBankAccountDialogOpen}
					>
						<SidebarMenuItem>
							<SidebarMenuButton render={<DialogTrigger />}>
								<LandmarkIcon />
								<span>Account</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="text-xl font-semibold">
									Account
								</DialogTitle>
							</DialogHeader>
							<VendorAccountForm
								defaultValues={{
									bankName: bankAccountResult.data?.bankAccount.bankName ?? "",
									branchCode:
										bankAccountResult.data?.bankAccount.branchCode ?? "",
									accountType:
										bankAccountResult.data?.bankAccount.accountType ?? "",
									accountName:
										bankAccountResult.data?.bankAccount.accountName ?? "",
									accountNumber:
										bankAccountResult.data?.bankAccount.accountNumber ?? "",
								}}
								isSubmitting={upsertBankAccountMutation.isPending}
								submitHandler={upsertBankAccountMutation.mutate}
								className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
							/>
						</DialogContent>
					</Dialog>
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
								className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
							/>
						</DialogContent>
					</Dialog>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
