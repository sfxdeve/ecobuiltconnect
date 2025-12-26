import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/sign-up/$")({
	head: () => ({
		meta: [
			{
				title: "Sign Up - EcobuiltConnect",
			},
			{
				name: "description",
				content: "",
			},
		],
	}),
	component: SignUpPage,
});

function SignUpPage() {
	return <SignUp />;
}
