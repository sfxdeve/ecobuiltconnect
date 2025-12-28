import { SignedIn, useUser } from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	EllipsisVerticalIcon,
	FileTextIcon,
	HomeIcon,
	MailIcon,
	PackageIcon,
	ShoppingBagIcon,
	StoreIcon,
	TruckIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { getUserProfile, upsertUserProfile } from "@/server/user/profile";
import {
	UserProfileForm,
	type userProfileFormSchema,
} from "../forms/urser-profile-form";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function AppHeaderUserOptionsMenu() {
	const { isSignedIn } = useUser();

	const [upsertUserProfileDialogOpen, setUpsertUserProfileDialogOpen] =
		useState(false);

	const getUserProfileFn = useServerFn(getUserProfile);
	const upsertUserProfileFn = useServerFn(upsertUserProfile);

	const queryClient = useQueryClient();

	const userProfileResult = useQuery({
		queryKey: ["profile"],
		queryFn: () => {
			if (isSignedIn) {
				return getUserProfileFn();
			}
		},
	});

	const upsertUserProfileMutation = useMutation({
		mutationFn: (data: z.infer<typeof userProfileFormSchema>) =>
			upsertUserProfileFn({ data }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["profile"],
			});

			setUpsertUserProfileDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<Dialog
			open={upsertUserProfileDialogOpen}
			onOpenChange={setUpsertUserProfileDialogOpen}
		>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="space-y-1">
					<DropdownMenuGroup className="md:hidden space-y-1">
						<DropdownMenuItem
							render={<Link to="/" activeProps={{ className: "bg-muted" }} />}
						>
							<HomeIcon />
							<span>Home</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<Link to="/products" activeProps={{ className: "bg-muted" }} />
							}
						>
							<ShoppingBagIcon />
							<span>Marketplace</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<Link to="/vendors" activeProps={{ className: "bg-muted" }} />
							}
						>
							<StoreIcon />
							<span>Vendors</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<Link to="/community" activeProps={{ className: "bg-muted" }} />
							}
						>
							<UsersIcon />
							<span>Community</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuGroup className="space-y-1">
						<DropdownMenuItem
							render={
								<Link
									to="/user/requests"
									activeProps={{ className: "bg-muted" }}
								/>
							}
						>
							<FileTextIcon />
							<span>Requests</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<Link
									to="/user/orders"
									activeProps={{ className: "bg-muted" }}
								/>
							}
						>
							<PackageIcon />
							<span>Orders</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							render={<Link to="/" activeProps={{ className: "bg-muted" }} />}
						>
							<TruckIcon />
							<span>Deliveries</span>
						</DropdownMenuItem>
						<SignedIn>
							<DropdownMenuItem render={<DialogTrigger className="w-full" />}>
								<UserIcon />
								<span>Profile</span>
							</DropdownMenuItem>
						</SignedIn>
					</DropdownMenuGroup>
					<DropdownMenuGroup className="md:hidden space-y-1">
						<DropdownMenuItem
							render={
								<Link to="/contact" activeProps={{ className: "bg-muted" }} />
							}
						>
							<MailIcon />
							<span>Contact</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Profile</DialogTitle>
				</DialogHeader>
				<UserProfileForm
					defaultValues={{
						address: userProfileResult.data?.profile?.address ?? "",
						city: userProfileResult.data?.profile?.city ?? "",
						postcode: userProfileResult.data?.profile?.postcode ?? "",
					}}
					isSubmitting={upsertUserProfileMutation.isPending}
					submitHandler={(data) => {
						upsertUserProfileMutation.mutate(data);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
