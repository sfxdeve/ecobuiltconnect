import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AdminProfileForm } from "@/components/forms/admin-profile-form";
import { UserProfileForm } from "@/components/forms/user-profile-form";
import { VendorProfileForm } from "@/components/forms/vendor-profile-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { upsertAdminProfile } from "@/remote/admin.profile";
import { getProfile } from "@/remote/shared.profile";
import { upsertUserProfile } from "@/remote/user.profile";
import { upsertVendorProfile } from "@/remote/vendor.profile";

export const Route = createFileRoute("/(public)")({
	component: PublicLayout,
});

function PublicLayout() {
	const { user } = useUser();

	const [profileDialogType, setProfileDialogType] = useState<
		"create-profile" | "prodile-status-info" | null
	>(null);

	const getProfileFn = useServerFn(getProfile);

	const profileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["shared-profile", user?.id],
		queryFn: getProfileFn,
	});

	useEffect(() => {
		if (profileResult.data) {
			if (!profileResult.data.profile) {
				setProfileDialogType("create-profile");
			} else if (profileResult.data.profile.status !== "APPROVED") {
				setProfileDialogType("prodile-status-info");
			}
		}
	}, [profileResult.data]);

	return (
		<>
			<main className="relative">
				<AppHeader />
				<Outlet />
				<AppFooter />
			</main>
			<Dialog
				open={profileDialogType !== null}
				onOpenChange={(open) => {
					if (!open) {
						setProfileDialogType(null);
					}
				}}
			>
				{profileDialogType === "create-profile" && (
					<CreateProfileDialogContent
						closeDialog={() => {
							setProfileDialogType(null);
						}}
					/>
				)}
				{profileDialogType === "prodile-status-info" && (
					<ProfileStatusInfoDialogContent />
				)}
			</Dialog>
		</>
	);
}

function CreateProfileDialogContent({
	closeDialog,
}: {
	closeDialog: () => void;
}) {
	const { user } = useUser();

	const upsertUserProfileFn = useServerFn(upsertUserProfile);
	const upsertVendorProfileFn = useServerFn(upsertVendorProfile);
	const upsertAdminProfileFn = useServerFn(upsertAdminProfile);

	const queryClient = useQueryClient();

	const upsertUserProfileMutation = useMutation({
		mutationFn: upsertUserProfileFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["user-profile", user?.id],
			});

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const upsertVendorProfileMutation = useMutation({
		mutationFn: upsertVendorProfileFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["vendor-profile", user?.id],
			});

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const upsertAdminProfileMutation = useMutation({
		mutationFn: upsertAdminProfileFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["admin-profile", user?.id],
			});

			closeDialog();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create Profile</DialogTitle>
			</DialogHeader>
			<Tabs>
				<TabsList>
					<TabsTrigger value="user">User</TabsTrigger>
					<TabsTrigger value="vendor">Vendor</TabsTrigger>
					{/* <TabsTrigger value="logistic">Logistic</TabsTrigger> */}
					<TabsTrigger value="admin">Admin</TabsTrigger>
				</TabsList>
				<TabsContent value="user">
					<UserProfileForm
						defaultValues={{
							address: "",
							city: "",
							postcode: "",
						}}
						isSubmitting={upsertUserProfileMutation.isPending}
						submitHandler={upsertUserProfileMutation.mutate}
					/>
				</TabsContent>
				<TabsContent value="admin">
					<AdminProfileForm
						defaultValues={{
							name: "",
							description: "",
						}}
						isSubmitting={upsertAdminProfileMutation.isPending}
						submitHandler={upsertAdminProfileMutation.mutate}
					/>
				</TabsContent>
				<TabsContent value="vendor">
					<VendorProfileForm
						defaultValues={{
							pictureKeys: [],
							name: "",
							description: "",
							address: "",
							city: "",
							postcode: "",
						}}
						isSubmitting={upsertVendorProfileMutation.isPending}
						submitHandler={upsertVendorProfileMutation.mutate}
					/>
				</TabsContent>
				<TabsContent value="logistic"></TabsContent>
			</Tabs>
		</DialogContent>
	);
}

function ProfileStatusInfoDialogContent() {
	// const navigate = Route.useNavigate();

	// const { user } = useUser();

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Profile Status Info</DialogTitle>
			</DialogHeader>
		</DialogContent>
	);
}
