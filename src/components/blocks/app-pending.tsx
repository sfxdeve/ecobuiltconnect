import { Spinner } from "@/components/ui/spinner";

export function AppPending() {
	return (
		<section className="container mx-auto flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4 px-4 py-12">
			<Spinner className="size-6" />
			<p className="text-center font-semibold text-muted-foreground">
				Loading...
			</p>
		</section>
	);
}
