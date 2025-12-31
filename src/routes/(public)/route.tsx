import { useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppFooter } from "@/components/blocks/app-footer";
import { AppHeader } from "@/components/blocks/app-header";
import { AppPending } from "@/components/blocks/app-pending";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile } from "@/lib/api/shared.profile";

export const Route = createFileRoute("/(public)")({
	pendingComponent: AppPending,
	component: PublicLayout,
});

function PublicLayout() {
	const { user } = useUser();

	const [profileDialogType, setProfileDialogType] = useState<
		"create" | "info" | null
	>(null);

	const getProfileFn = useServerFn(getProfile);

	const profileResult = useQuery({
		queryKey: ["shared-profile", user?.id],
		queryFn: getProfileFn,
	});

	useEffect(() => {
		if (profileResult.data) {
			if (!profileResult.data.profile) {
				setProfileDialogType("create");
			} else if (profileResult.data.profile.status !== "APPROVED") {
				setProfileDialogType("info");
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
				{profileDialogType === "create" && <CreateProfileDialogContent />}
				{profileDialogType === "info" && <ProfileInfoDialogContent />}
			</Dialog>
		</>
	);
}

function CreateProfileDialogContent() {
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create Profile</DialogTitle>
				<Tabs>
					<TabsList>
						<TabsTrigger value="user">User</TabsTrigger>
						<TabsTrigger value="admin">Admin</TabsTrigger>
						<TabsTrigger value="vendor">Vendor</TabsTrigger>
						<TabsTrigger value="logistic">Logistic</TabsTrigger>
					</TabsList>
					<TabsContent value="user"></TabsContent>
					<TabsContent value="admin"></TabsContent>
					<TabsContent value="vendor"></TabsContent>
					<TabsContent value="logistic"></TabsContent>
				</Tabs>
			</DialogHeader>
		</DialogContent>
	);
}

function ProfileInfoDialogContent() {
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Profile Info</DialogTitle>
			</DialogHeader>
		</DialogContent>
	);
}
