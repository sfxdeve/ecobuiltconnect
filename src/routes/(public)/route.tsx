import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { UserProfileForm } from "@/components/forms/user-profile-form";
import { VendorProfileForm } from "@/components/forms/vendor-profile-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile } from "@/lib/api/shared.profile";
import { upsertUserProfile } from "@/lib/api/user.profile";
import { upsertVendorProfile } from "@/lib/api/vendor.profile";

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

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create Profile</DialogTitle>
				<Tabs>
					<TabsList>
						<TabsTrigger value="user">User</TabsTrigger>
						{/* <TabsTrigger value="admin">Admin</TabsTrigger> */}
						<TabsTrigger value="vendor">Vendor</TabsTrigger>
						{/* <TabsTrigger value="logistic">Logistic</TabsTrigger> */}
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
					<TabsContent value="admin"></TabsContent>
					<TabsContent value="vendor">
						<VendorProfileForm
							defaultValues={{
								pictureId: "/test.jpg",
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
			</DialogHeader>
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
