import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ title }: { title: string }) {
	return (
		<header>
			<div className={"p-4 flex items-center justify-between"}>
				<div>
					<h2>{title}</h2>
					<p></p>
				</div>
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
			</div>
		</header>
	);
}
