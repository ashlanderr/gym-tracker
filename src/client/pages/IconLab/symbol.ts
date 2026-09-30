import logo from "../../../../pwa-assets/logo.svg?raw";

const PART_IDS = ["loops", "swooshes", "bar", "plates"] as const;

const document = new DOMParser().parseFromString(logo, "image/svg+xml");

const pathOf = (id: string) => {
  const d = document.getElementById(id)?.getAttribute("d");
  if (!d) throw new Error(`logo.svg has no path #${id}`);
  return d;
};

// The paths live in the logo's own coordinates: a 1000 unit square that the
// logo scales into its tile.
export const SYMBOL_SIZE = 1000;

export const SYMBOL_PARTS = Object.fromEntries(
  PART_IDS.map((id) => [id, pathOf(id)]),
) as Record<(typeof PART_IDS)[number], string>;
