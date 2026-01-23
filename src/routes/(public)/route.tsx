import { useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileStatus } from "@/prisma/generated/enums";
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
		"create-profile" | "profile-status-info" | null
	>("profile-status-info");

	const getProfileFn = useServerFn(getProfile);

	const profileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["shared-profile", user?.id],
		queryFn: () => getProfileFn(),
	});

	useEffect(() => {
		if (profileResult.data) {
			if (!profileResult.data.profile) {
				setProfileDialogType("create-profile");
			} else if (profileResult.data.profile.status !== "APPROVED") {
				setProfileDialogType("profile-status-info");
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
				{profileDialogType === "profile-status-info" && (
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
							name: "",
							address: "",
							city: "",
							postcode: "",
						}}
						isSubmitting={upsertUserProfileMutation.isPending}
						submitHandler={upsertUserProfileMutation.mutate}
						className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
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
						className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
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
						className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
					/>
				</TabsContent>
				<TabsContent value="logistic"></TabsContent>
			</Tabs>
		</DialogContent>
	);
}

function ProfileStatusInfoDialogContent() {
	const { user } = useUser();

	const getProfileFn = useServerFn(getProfile);

	const profileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["shared-profile", user?.id],
		queryFn: () => getProfileFn(),
	});

	if (profileResult.isPending) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Profile Status</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-muted-foreground">
					Loading profile status...
				</div>
			</DialogContent>
		);
	}

	if (profileResult.isError) {
		return (
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Profile Status</DialogTitle>
				</DialogHeader>
				<div className="py-8 text-center text-destructive">
					Unable to load profile status: {profileResult.error.message}
				</div>
			</DialogContent>
		);
	}

	const status = profileResult.data.profile?.status ?? null;

	const statusCopy = {
		[ProfileStatus.PENDING]: {
			title: "Under review",
			description:
				"Your profile is being reviewed by our team. You will get access once it is approved.",
		},
		[ProfileStatus.REJECTED]: {
			title: "Needs attention",
			description:
				"Your profile was not approved. Please contact support for guidance on next steps.",
		},
		[ProfileStatus.APPROVED]: {
			title: "Approved",
			description: "Your profile is approved and ready to use.",
		},
	} as const;

	const activeStatus = status ? statusCopy[status] : null;

	return (
		<DialogContent className="sm:max-w-lg">
			<DialogHeader>
				<DialogTitle>Profile Status</DialogTitle>
			</DialogHeader>
			<div className="space-y-4">
				<Item variant="outline">
					<ItemContent>
						<ItemTitle>{activeStatus?.title ?? "Status"}</ItemTitle>
						<ItemDescription>
							{activeStatus?.description ??
								"Your profile status is currently unavailable."}
						</ItemDescription>
					</ItemContent>
				</Item>
			</div>
			<DialogFooter>
				<p>
					Need help? Email{" "}
					<a
						href="mailto:support@ecobuiltconnect.co.za"
						className="text-primary"
					>
						support@ecobuiltconnect.co.za
					</a>{" "}
					or visit our{" "}
					<Link to="/contact" className="text-primary">
						contact page
					</Link>
					.
				</p>
			</DialogFooter>
		</DialogContent>
	);
}
