import { Link } from "@tanstack/react-router";
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
import { AppProfileForm } from "../forms/app-profile-form";
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

export function AppUserOptionsMenu() {
	return (
		<Dialog>
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
						<DropdownMenuItem render={<DialogTrigger className="w-full" />}>
							<UserIcon />
							<span>Profile</span>
						</DropdownMenuItem>
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
				<AppProfileForm
					defaultValues={{
						address: "",
						city: "",
						postcode: "",
					}}
					isSubmitting={
						// updateUserProfileMutation.isPending
						false
					}
					submitHandler={() => {
						// updateUserProfileMutation.mutate(data);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
