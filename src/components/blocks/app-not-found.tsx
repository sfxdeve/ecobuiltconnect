export function AppNotFound() {
	return (
		<main>
			<section>
				<div className="container mx-auto py-12 px-4 min-h-screen flex flex-col gap-4 justify-center items-center">
					<h3 className="text-center text-3xl font-bold">
						404 — Page Not Found
					</h3>

					<p className="max-w-2xl text-center font-semibold text-muted-foreground">
						Sorry, we couldn't find the page you're looking for. It may have
						been moved, deleted, or the URL might be incorrect.
					</p>
				</div>
			</section>
		</main>
	);
}
