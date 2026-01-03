import { useSyncExternalStore } from "react";

export function useIsMobile(mobileBreakpoint = 768) {
	const query = `(max-width: ${mobileBreakpoint - 1}px)`;

	return useSyncExternalStore(
		(callback) => {
			const mql = window.matchMedia(query);

			mql.addEventListener("change", callback);

			return () => mql.removeEventListener("change", callback);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
}
