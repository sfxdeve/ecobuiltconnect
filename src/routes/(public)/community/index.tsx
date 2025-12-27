import { createFileRoute } from "@tanstack/react-router";
import { AppCommingSoon } from "@/components/blocks/app-comming-soon";

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
	return <AppCommingSoon />;
}
