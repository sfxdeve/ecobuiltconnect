import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Button } from "@/components/ui/button";

export function VendorHeader({ title }: { title: string }) {
	return (
		<header className={"flex items-center justify-between p-4"}>
			<div>{title}</div>
			<div className="flex items-center gap-4">
				<SignedIn>
					<UserButton
						appearance={{
							elements: {
								userButtonAvatarBox: "size-9!",
							},
						}}
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton>
						<Button variant="default" size="lg">
							Sign In
						</Button>
					</SignInButton>
				</SignedOut>
			</div>
		</header>
	);
}
