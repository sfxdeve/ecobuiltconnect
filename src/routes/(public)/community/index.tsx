import { createFileRoute } from "@tanstack/react-router";
import { AppComingSoon } from "@/components/blocks/app-coming-soon";

export const Route = createFileRoute("/(public)/community/")({
	head: () => ({
		meta: [
			{
				title: "Community - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: CommunityPage,
});

function CommunityPage() {
	return <AppComingSoon />;
}
