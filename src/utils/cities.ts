type PlaceType = "city" | "town" | "village";

function buildQuery(iso2: string, placeTypes: PlaceType[]) {
	const iso = iso2.toUpperCase();
	const regex = `^(${placeTypes.join("|")})$`;

	return `
[out:json][timeout:180];
area["ISO3166-1"="${iso}"][admin_level=2]->.country;
(
  node["place"~"${regex}"](area.country);
  way["place"~"${regex}"](area.country);
  relation["place"~"${regex}"](area.country);
);
out tags;
`.trim();
}

export async function fetchPlaceNamesByCountry(
	iso2: string,
	placeTypes: PlaceType[] = ["city"],
): Promise<string[]> {
	const query = buildQuery(iso2, placeTypes);

	const url = new URL("https://overpass-api.de/api/interpreter");

	url.searchParams.set("data", query);

	const res = await fetch(url, { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);

	const data = (await res.json()) as {
		elements: { tags?: { name?: string } }[];
	};

	const names = data.elements
		.map((e) => e.tags?.name)
		.filter((x): x is string => Boolean(x));

	return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
