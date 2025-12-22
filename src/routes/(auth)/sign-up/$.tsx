import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/sign-up/$")({
	component: SignUpPage,
});

function SignUpPage() {
	return <SignUp />;
}
