import { useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileTextIcon, PackageIcon, UserIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getProfile } from "@/lib/api/shared.profile";

export function AppHeaderRoleSpecificMenuGroup({
	setProfileDialogType,
}: {
	setProfileDialogType: Dispatch<SetStateAction<"create-profile" | null>>;
}) {
	const { user } = useUser();

	const getProfileFn = useServerFn(getProfile);

	const profileResult = useQuery({
		enabled: !!user?.id,
		queryKey: ["shared-profile", user?.id],
		queryFn: getProfileFn,
	});

	if (
		profileResult.isPending ||
		profileResult.isError ||
		profileResult.data.role === null
	) {
		return null;
	}

	if (profileResult.data.role === "user") {
		return (
			<DropdownMenuGroup className="space-y-1">
				<DropdownMenuItem
					render={
						<Link to="/user/orders" activeProps={{ className: "bg-muted" }} />
					}
				>
					<PackageIcon />
					<span>Orders</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					render={
						<Link to="/user/requests" activeProps={{ className: "bg-muted" }} />
					}
				>
					<FileTextIcon />
					<span>Requests</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setProfileDialogType("create-profile");
					}}
				>
					<UserIcon />
					<span>Profile</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
		);
	}

	if (profileResult.data.role === "vendor") {
		return (
			<DropdownMenuGroup className="mb-0">
				<DropdownMenuItem
					render={
						<Link to="/vendor/orders" activeProps={{ className: "bg-muted" }} />
					}
				>
					<PackageIcon />
					<span>Dashboard</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
		);
	}

	if (profileResult.data.role === "admin") {
		return (
			<DropdownMenuGroup className="mb-0">
				<DropdownMenuItem
					render={
						<Link
							to="/admin/categories"
							activeProps={{ className: "bg-muted" }}
						/>
					}
				>
					<PackageIcon />
					<span>Dashboard</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
		);
	}

	return null;
}
