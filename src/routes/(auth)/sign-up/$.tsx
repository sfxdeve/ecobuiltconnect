import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { AppPending } from "@/components/blocks/app-pending";

export const Route = createFileRoute("/(auth)/sign-up/$")({
	head: () => ({
		meta: [
			{
				title: "Sign Up",
			},
			{
				name: "description",
				content: "Sign up for a new EcobuiltConnect account today.",
			},
		],
	}),
	component: SignUpPage,
	pendingComponent: AppPending,
});

function SignUpPage() {
	return <SignUp />;
}
