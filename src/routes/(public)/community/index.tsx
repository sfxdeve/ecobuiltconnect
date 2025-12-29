import { createFileRoute } from "@tanstack/react-router";
import { AppComingSoon } from "@/components/blocks/app-coming-soon";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(public)/community/")({
	head: () => ({
		meta: [
			{
				title: "Community - EcobuiltConnect",
			},
			{
				name: "description",
				content:
					"Join the EcobuiltConnect community. Share ideas, discuss sustainable building practices, and connect with like-minded individuals.",
			},
		],
	}),
	component: CommunityPage,
	pendingComponent: AppPending,
});

function CommunityPage() {
	return <AppComingSoon />;
}
