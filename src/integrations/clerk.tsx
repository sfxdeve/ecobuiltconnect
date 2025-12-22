import { ClerkProvider } from "@clerk/tanstack-react-start";

export function AppClerkProvider({ children }: { children: React.ReactNode }) {
	return <ClerkProvider>{children}</ClerkProvider>;
}
