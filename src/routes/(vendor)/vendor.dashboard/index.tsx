import { createFileRoute } from "@tanstack/react-router";
import {
	type LucideIcon,
	PackageIcon,
	ShoppingBagIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import { AppPending } from "@/components/blocks/app-pending";
import { DashboardHeader } from "@/components/blocks/dashboard-header";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { formatMoneyFromCents } from "@/lib/formatters";

export const Route = createFileRoute("/(vendor)/vendor/dashboard/")({
	head: () => ({
		meta: [
			{
				title: "Dashboard",
			},
			{
				name: "description",
				content:
					"Vendor dashboard overview. Monitor sales, orders, and performance.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: VendorDashboardPage,
});

function VendorDashboardPage() {
	const items: {
		icon: LucideIcon;
		label: string;
		kpi: string;
	}[] = [
		{
			icon: TrendingUpIcon,
			label: "Total Sales",
			kpi: formatMoneyFromCents(0, {
				locale: "en-ZA",
				currency: "ZAR",
			}),
		},
		{
			icon: ShoppingBagIcon,
			label: "Fulfilled Orders",
			kpi: "0",
		},
		{
			icon: PackageIcon,
			label: "Live Products",
			kpi: "0",
		},
		{
			icon: UsersIcon,
			label: "Active Customers",
			kpi: "0",
		},
	];

	return (
		<>
			<DashboardHeader title="Dashboard" />
			<section>
				<div className="p-4 space-y-6 min-h-screen">
					<ItemGroup className="flex-row">
						{items.map((item) => (
							<Item key={item.label} variant="outline">
								<ItemMedia variant="icon">
									<item.icon className="size-6" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="text-xl">{item.kpi}</ItemTitle>
									<ItemDescription>{item.label}</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</div>
			</section>
		</>
	);
}
