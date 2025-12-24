import { Link } from "@tanstack/react-router";
import { BoxIcon, HistoryIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function AppUserOptionsMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
				<HistoryIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="space-y-1">
				<DropdownMenuItem
					render={<Link to="/orders" activeProps={{ className: "bg-muted" }} />}
				>
					<BoxIcon />
					<span>Orders</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					render={
						<Link to="/checkout" activeProps={{ className: "bg-muted" }} />
					}
				>
					<ShoppingCartIcon />
					<span>Checkout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
