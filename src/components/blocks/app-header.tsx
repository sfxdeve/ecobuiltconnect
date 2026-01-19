import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useUser,
} from "@clerk/tanstack-react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	EllipsisVerticalIcon,
	HomeIcon,
	MailIcon,
	ShoppingBagIcon,
	StoreIcon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppHeaderCart } from "@/components/blocks/app-header-cart";
import { AppHeaderRoleSpecificMenuGroup } from "@/components/blocks/app-header-role-specific-menu-group";
import { UserProfileForm } from "@/components/forms/user-profile-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getUserProfile, upsertUserProfile } from "@/remote/user.profile";

export function AppHeader() {
	const { isSignedIn } = useUser();

	const [profileDialogType, setProfileDialogType] = useState<
		"create-profile" | null
	>(null);

	return (
		<header className="absolute top-0 left-0 right-0 z-50 bg-background">
			<div className="container mx-auto py-4 px-4 flex items-center justify-between">
				<div>
					<Link to="/" aria-label="Go to home">
						<img className="size-18" src="/logo-192x192.png" alt="Logo" />
					</Link>
				</div>
				<nav>
					<ul className="hidden md:flex lg:gap-4 gap-2 items-center">
						<li>
							<Link
								to="/"
								className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
								activeProps={{ className: "bg-muted" }}
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/products"
								className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
								activeProps={{ className: "bg-muted" }}
							>
								Marketplace
							</Link>
						</li>
						<li>
							<Link
								to="/vendors"
								className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
								activeProps={{ className: "bg-muted" }}
							>
								Vendors
							</Link>
						</li>
						<li>
							<Link
								to="/community"
								className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
								activeProps={{ className: "bg-muted" }}
							>
								Community
							</Link>
						</li>
						<li>
							<Link
								to="/contact"
								className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
								activeProps={{ className: "bg-muted" }}
							>
								Contact
							</Link>
						</li>
					</ul>
				</nav>
				<div className="flex items-center gap-4">
					<AppHeaderCart />
					<SignedIn>
						<UserButton
							appearance={{
								elements: {
									userButtonAvatarBox: "size-9!",
								},
							}}
						/>
					</SignedIn>
					<SignedOut>
						<SignInButton>
							<Button variant="default" size="lg">
								Sign In
							</Button>
						</SignInButton>
					</SignedOut>
					<Dialog
						open={profileDialogType !== null}
						onOpenChange={(open) => {
							if (!open) {
								setProfileDialogType(null);
							}
						}}
					>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={<Button variant="outline" size="icon" />}
								className={cn(!isSignedIn && "md:hidden")}
							>
								<EllipsisVerticalIcon />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="space-y-1">
								<DropdownMenuGroup className="md:hidden space-y-1">
									<DropdownMenuItem
										render={
											<Link to="/" activeProps={{ className: "bg-muted" }} />
										}
									>
										<HomeIcon />
										<span>Home</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										render={
											<Link
												to="/products"
												activeProps={{ className: "bg-muted" }}
											/>
										}
									>
										<ShoppingBagIcon />
										<span>Marketplace</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										render={
											<Link
												to="/vendors"
												activeProps={{ className: "bg-muted" }}
											/>
										}
									>
										<StoreIcon />
										<span>Vendors</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										render={
											<Link
												to="/community"
												activeProps={{ className: "bg-muted" }}
											/>
										}
									>
										<UsersIcon />
										<span>Community</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<SignedIn>
									<AppHeaderRoleSpecificMenuGroup
										setProfileDialogType={setProfileDialogType}
									/>
								</SignedIn>
								<DropdownMenuGroup className="md:hidden space-y-1">
									<DropdownMenuItem
										render={
											<Link
												to="/contact"
												activeProps={{ className: "bg-muted" }}
											/>
										}
									>
										<MailIcon />
										<span>Contact</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
						{profileDialogType === "create-profile" && (
							<CreateProfileDialogContent
								closeDialog={() => {
									setProfileDialogType(null);
								}}
							/>
						)}
					</Dialog>
				</div>
			</div>
		</header>
	);
}

function CreateProfileDialogContent({
	closeDialog,
}: {
	closeDialog: () => void;
}) {
	const { user } = useUser();

	const getUserProfileFn = useServerFn(getUserProfile);
	const upsertUserProfileFn = useServerFn(upsertUserProfile);

	const queryClient = useQueryClient();

	const userProfileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["user-profile", user?.id],
		queryFn: getUserProfileFn,
	});

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

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Profile</DialogTitle>
			</DialogHeader>
			<UserProfileForm
				defaultValues={{
					name: userProfileResult.data?.userProfile?.name ?? "",
					address: userProfileResult.data?.userProfile?.address ?? "",
					city: userProfileResult.data?.userProfile?.city ?? "",
					postcode: userProfileResult.data?.userProfile?.postcode ?? "",
				}}
				isSubmitting={upsertUserProfileMutation.isPending}
				submitHandler={upsertUserProfileMutation.mutate}
				className="max-h-[80dvh] overflow-y-auto no-scrollbar p-1"
			/>
		</DialogContent>
	);
}
