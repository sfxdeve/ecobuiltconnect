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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoneyFromCents } from "@/lib/formatters";
import { getKpis } from "@/remote/vendor.kpis";
import { getOrderRequests } from "@/remote/vendor.order-request";
import { getUserProfiles } from "@/remote/vendor.user-profile";

export const Route = createFileRoute("/(vendor)/vendor/dashboard/")({
	loader: async () => {
		const [kpisData, orderRequestData, userProfilesData] = await Promise.all([
			getKpis(),
			getOrderRequests({ data: { limit: 5 } }),
			getUserProfiles({ data: { limit: 5 } }),
		]);

		return { ...kpisData, ...orderRequestData, ...userProfilesData };
	},
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
	const loaderData = Route.useLoaderData();

	const items: {
		icon: LucideIcon;
		label: string;
		kpi: string;
	}[] = [
		{
			icon: TrendingUpIcon,
			label: "Total Sales",
			kpi: formatMoneyFromCents(loaderData.totalSales, {
				locale: "en-ZA",
				currency: "ZAR",
			}),
		},
		{
			icon: ShoppingBagIcon,
			label: "Fulfilled Orders",
			kpi: `${loaderData.fullfilledOrderRequests}`,
		},
		{
			icon: PackageIcon,
			label: "Live Products",
			kpi: `${loaderData.liveProducts}`,
		},
		{
			icon: UsersIcon,
			label: "Active Users",
			kpi: `${loaderData.activeUserProfiles}`,
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
					<div className="flex flex-col md:flex-row gap-4">
						<Card className="flex-1 md:flex-3">
							<CardContent>
								{loaderData.orderRequests.length > 0 ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Order Ref</TableHead>
												<TableHead>Items</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Total</TableHead>
												<TableHead>Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{loaderData.orderRequests.map((orderRequest) => {
												let statusBadgeVariant:
													| "default"
													| "outline"
													| "destructive";

												switch (orderRequest.status) {
													case "PAID":
													case "COMPLETED":
														statusBadgeVariant = "default";
														break;
													case "CANCELLED":
														statusBadgeVariant = "destructive";
														break;
													default:
														statusBadgeVariant = "outline";
														break;
												}

												return (
													<TableRow key={orderRequest.id}>
														<TableCell className="uppercase">
															#{orderRequest.id.slice(24)}
														</TableCell>
														<TableCell>
															{orderRequest._count.orderItems}
														</TableCell>
														<TableCell>
															<Badge variant={statusBadgeVariant}>
																{orderRequest.status}
															</Badge>
														</TableCell>
														<TableCell>
															{formatMoneyFromCents(orderRequest.total, {
																locale: "en-ZA",
																currency: "ZAR",
															})}
														</TableCell>
														<TableCell>
															{formatDate(orderRequest.createdAt)}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								) : (
									<Empty className="bg-muted">
										<EmptyHeader>
											<EmptyTitle>No results found</EmptyTitle>
										</EmptyHeader>
									</Empty>
								)}
							</CardContent>
						</Card>
						<Card className="flex-1 md:flex-2">
							<CardContent>
								{loaderData?.userProfiles?.length > 0 ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{loaderData.userProfiles.map((userProfile) => {
												return (
													<TableRow key={userProfile.id}>
														<TableCell>{userProfile.name}</TableCell>
														<TableCell>{userProfile.status}</TableCell>
														<TableCell>
															{formatDate(userProfile.createdAt)}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								) : (
									<Empty className="bg-muted">
										<EmptyHeader>
											<EmptyTitle>No results found</EmptyTitle>
										</EmptyHeader>
									</Empty>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</>
	);
}
