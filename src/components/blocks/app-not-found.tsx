export function AppNotFound() {
	return (
		<section className="container mx-auto flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4 px-4 py-12">
			<h3 className="text-center text-3xl font-bold">404 — Page Not Found</h3>

			<p className="max-w-2xl text-center font-semibold text-muted-foreground">
				Sorry, we couldn't find the page you're looking for. It may have been
				moved, deleted, or the URL might be incorrect.
			</p>
		</section>
	);
}
