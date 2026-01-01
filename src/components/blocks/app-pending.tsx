import { Spinner } from "@/components/ui/spinner";

export function AppPending() {
	return (
		<section>
			<div className="container mx-auto py-12 px-4 min-h-screen flex flex-col gap-4 justify-center items-center">
				<Spinner className="size-6" />
				<p className="text-center font-semibold text-muted-foreground">
					Loading...
				</p>
			</div>
		</section>
	);
}
