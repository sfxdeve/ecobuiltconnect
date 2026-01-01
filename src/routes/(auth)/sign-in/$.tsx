import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(auth)/sign-in/$")({
	head: () => ({
		meta: [
			{
				title: "Sign In",
			},
			{
				name: "description",
				content: "Sign in to your EcobuiltConnect account.",
			},
		],
	}),
	component: SignInPage,
	pendingComponent: AppPending,
});

function SignInPage() {
	return <SignIn />;
}
