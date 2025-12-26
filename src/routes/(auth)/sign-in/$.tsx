import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/sign-in/$")({
	head: () => ({
		meta: [
			{
				title: "Sign In - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: SignInPage,
});

function SignInPage() {
	return <SignIn />;
}
