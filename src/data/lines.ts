/**
 * Line/route definitions with colors for each transit system.
 *
 * For NYC, we map from the "Line" (infrastructure) to the routes that run on
 * it. The Wikipedia data gives us line names like "Canarsie Line"; we convert
 * those to the familiar letter/number bullets.
 *
 * For other systems the mapping is simpler — split on known line names and
 * assign colors.
 */

export interface LineBadge {
   label: string;
   bg: string;
   bg2?: string; // optional second color for split/two-tone badges (e.g. GCRTA Waterfront)
   fg: string;
 }

// ─── NYC Subway ──────────────────────────────────────────────────────────────

const nycRouteColors: Record<string, { bg: string; fg: string }> = {
  "1": { bg: "#EE352E", fg: "#fff" },
  "2": { bg: "#EE352E", fg: "#fff" },
  "3": { bg: "#EE352E", fg: "#fff" },
  "4": { bg: "#00933C", fg: "#fff" },
  "5": { bg: "#00933C", fg: "#fff" },
  "6": { bg: "#00933C", fg: "#fff" },
  "7": { bg: "#B933AD", fg: "#fff" },
  A: { bg: "#0039A6", fg: "#fff" },
  C: { bg: "#0039A6", fg: "#fff" },
  E: { bg: "#0039A6", fg: "#fff" },
  B: { bg: "#FF6319", fg: "#fff" },
  D: { bg: "#FF6319", fg: "#fff" },
  F: { bg: "#FF6319", fg: "#fff" },
  M: { bg: "#FF6319", fg: "#fff" },
  G: { bg: "#6CBE45", fg: "#fff" },
  J: { bg: "#996633", fg: "#fff" },
  Z: { bg: "#996633", fg: "#fff" },
  L: { bg: "#A7A9AC", fg: "#fff" },
  N: { bg: "#FCCC0A", fg: "#000" },
  Q: { bg: "#FCCC0A", fg: "#000" },
  R: { bg: "#FCCC0A", fg: "#000" },
  W: { bg: "#FCCC0A", fg: "#000" },
  S: { bg: "#808183", fg: "#fff" },
  SIR: { bg: "#0039A6", fg: "#fff" },
};

/**
 * Map from the infrastructure line name (as scraped from Wikipedia) to the
 * revenue routes that typically run on that line. This doesn't need to be
 * perfect for every service pattern — it just needs to give a reasonable set
 * of route bullets for display.
 */
const nycLineToRoutes: Record<string, string[]> = {
  // IRT
  "Broadway–Seventh Avenue Line": ["1", "2", "3"],
  "Seventh Avenue Line": ["1", "2", "3"],
  "Lenox Avenue Line": ["2", "3"],
  "White Plains Road Line": ["2", "5"],
  "Nostrand Avenue Line": ["2", "5"],
  "New Lots Line": ["3", "4"],
  "Lexington Avenue Line": ["4", "5", "6"],
  "Jerome Avenue Line": ["4"],
  "Pelham Line": ["6"],
  "Flushing Line": ["7"],
  "IRT Flushing Line": ["7"],
  "Dyre Avenue Line": ["5"],
  "Eastern Parkway Line": ["2", "3", "4", "5"],

  // IND
  "Eighth Avenue Line": ["A", "C", "E"],
  "Sixth Avenue Line": ["B", "D", "F", "M"],
  "Crosstown Line": ["G"],
  "Queens Boulevard Line": ["E", "F", "M", "R"],
  "Concourse Line": ["B", "D"],
  "Culver Line": ["F", "G"],
  "IND Culver Line": ["F", "G"],
  "Fulton Street Line": ["A", "C"],
  "Rockaway Line": ["A"],
  "63rd Street Line": ["F", "Q"],
  "IND 63rd Street Line": ["F", "Q"],
  "Archer Avenue Line": ["E", "J", "Z"],
  "IND Archer Avenue Line": ["E", "J", "Z"],

  // BMT
  "Broadway Line": ["N", "Q", "R", "W"],
  "BMT Broadway Line": ["N", "Q", "R", "W"],
  "Canarsie Line": ["L"],
  "Jamaica Line": ["J", "Z"],
  "Nassau Street Line": ["J", "Z"],
  "Myrtle Avenue Line": ["M"],
  "Brighton Line": ["B", "Q"],
  "BMT Brighton Line": ["B", "Q"],
  "Sea Beach Line": ["N"],
  "BMT Sea Beach Line": ["N"],
  "West End Line": ["D"],
  "BMT West End Line": ["D"],
  "Fourth Avenue Line": ["D", "N", "R"],
  "Astoria Line": ["N", "W"],
  "BMT Astoria Line": ["N", "W"],
  "Franklin Avenue Line": ["S"],

  // SAS
  "Second Avenue Line": ["Q"],

  // Other
  "42nd Street Line": ["S"],
  "42nd Street Shuttle": ["S"],
};

const rockawayShuttleStations = new Set([
  "Broad Channel",
  "Beach 90th Street",
  "Beach 98th Street",
  "Beach 105th Street",
  "Rockaway Park–Beach 116th Street",
]);

function parseNycLine(lineStr: string, stationName?: string, routes?: string): LineBadge[] {
  if (!lineStr && !routes) return [];

  const routeSet = new Set<string>();

  if (routes) {
    for (const r of routes.split(",")) routeSet.add(r.trim());
  } else {
    const lineParts = lineStr.split(",").map((s) => s.trim());

    for (const part of lineParts) {
      const cleaned = part
        .replace(/^(BMT|IRT|IND)\s+/, "")
        .replace(/\s+Line$/, "")
        .concat(" Line");

      const lineRoutes = nycLineToRoutes[cleaned] || nycLineToRoutes[part];
      if (lineRoutes) {
        for (const r of lineRoutes) routeSet.add(r);
      }
    }

    if (stationName && rockawayShuttleStations.has(stationName)) {
      routeSet.add("S");
    }
  }

  if (routeSet.size === 0) {
    return [{ label: lineStr, bg: "#666", fg: "#fff" }];
  }

  // Sort in official NYC system order
  const nycOrder = "A C E B D F M G L J Z N Q R W S 1 2 3 4 5 6 7".split(" ");
  const sorted = [...routeSet].sort((a, b) => {
    const ai = nycOrder.indexOf(a);
    const bi = nycOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return sorted.map((r) => ({
    label: r,
    ...(nycRouteColors[r] || { bg: "#666", fg: "#fff" }),
  }));
}

// ─── Washington Metro ────────────────────────────────────────────────────────

const wmataLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#BF0D3E", fg: "#fff" },
  Orange: { bg: "#ED8B00", fg: "#fff" },
  Silver: { bg: "#919D9D", fg: "#fff" },
  Blue: { bg: "#009CDE", fg: "#fff" },
  Yellow: { bg: "#FFD100", fg: "#000" },
  Green: { bg: "#00B140", fg: "#fff" },
};

// ─── Chicago L ───────────────────────────────────────────────────────────────

const ctaLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#C60C30", fg: "#fff" },
  Blue: { bg: "#00A1DE", fg: "#fff" },
  Brown: { bg: "#62361B", fg: "#fff" },
  Green: { bg: "#009B3A", fg: "#fff" },
  Orange: { bg: "#F9461C", fg: "#fff" },
  Pink: { bg: "#E27EA6", fg: "#fff" },
  Purple: { bg: "#522398", fg: "#fff" },
  Yellow: { bg: "#F9E300", fg: "#000" },
};

// ─── BART ────────────────────────────────────────────────────────────────────

const bartLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#EF4136", fg: "#fff" },
  Orange: { bg: "#ED8B00", fg: "#fff" },
  Yellow: { bg: "#FFE800", fg: "#000" },
  Green: { bg: "#4DB848", fg: "#fff" },
  Blue: { bg: "#00AEEF", fg: "#fff" },
  Beige: { bg: "#D5B479", fg: "#000" },
};

// ─── MBTA ────────────────────────────────────────────────────────────────────

const mbtaLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#DA291C", fg: "#fff" },
  Orange: { bg: "#ED8B00", fg: "#fff" },
  Blue: { bg: "#003DA5", fg: "#fff" },
  Green: { bg: "#00843D", fg: "#fff" },
  Silver: { bg: "#7C878E", fg: "#fff" },
};

// ─── SEPTA ───────────────────────────────────────────────────────────────────

const septaLineColors: Record<string, { bg: string; fg: string }> = {
  "Broad Street": { bg: "#F58220", fg: "#fff" },
  "Market–Frankford": { bg: "#0070C0", fg: "#fff" },
  BSL: { bg: "#F58220", fg: "#fff" },
  MFL: { bg: "#0070C0", fg: "#fff" },
};

// ─── MARTA ───────────────────────────────────────────────────────────────────

const martaLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#CE2029", fg: "#fff" },
  Gold: { bg: "#D4A843", fg: "#fff" },
  Blue: { bg: "#0075C2", fg: "#fff" },
  Green: { bg: "#009A44", fg: "#fff" },
};

/**
 * MARTA station → lines mapping. MARTA's Wikipedia table uses color icons
 * that we can't scrape, so we maintain this manually.
 */
const martaStationLines: Record<string, string[]> = {
  "Airport": ["Red", "Gold"],
  "Arts Center": ["Red", "Gold"],
  "Ashby": ["Blue", "Green"],
  "Avondale": ["Blue"],
  "Bankhead": ["Green"],
  "Brookhaven/Oglethorpe": ["Gold"],
  "Buckhead": ["Red"],
  "Chamblee": ["Gold"],
  "Civic Center": ["Red", "Gold"],
  "College Park": ["Red", "Gold"],
  "Decatur": ["Blue"],
  "Doraville": ["Gold"],
  "Dunwoody": ["Red"],
  "East Lake": ["Blue"],
  "East Point": ["Red", "Gold"],
  "Edgewood/Candler Park": ["Blue"],
  "Five Points": ["Red", "Gold", "Blue", "Green"],
  "Garnett": ["Red", "Gold"],
  "Georgia State": ["Blue", "Green"],
  "Hamilton E. Holmes": ["Blue"],
  "Indian Creek": ["Blue"],
  "Inman Park/Reynoldstown": ["Blue"],
  "Kensington": ["Blue"],
  "King Memorial": ["Blue", "Green"],
  "Lakewood/Fort McPherson": ["Red", "Gold"],
  "Lenox": ["Gold"],
  "Lindbergh Center": ["Red", "Gold"],
  "Medical Center": ["Red"],
  "Midtown": ["Red", "Gold"],
  "North Avenue": ["Red", "Gold"],
  "North Springs": ["Red"],
  "Oakland City": ["Red", "Gold"],
  "Peachtree Center": ["Red", "Gold"],
  "Sandy Springs": ["Red"],
  "Vine City": ["Blue", "Green"],
  "West End": ["Red", "Gold"],
  "West Lake": ["Green"],
};

// ─── GCRTA ───────────────────────────────────────────────────────────────────

const gcrtaLineColors: Record<string, { bg: string; fg: string }> = {
  Red: { bg: "#D7242A", fg: "#fff" },
  Green: { bg: "#8AAD36", fg: "#fff" },
  Blue: { bg: "#40679A", fg: "#fff" },
};

// ─── Generic color-name splitter ─────────────────────────────────────────────

function splitColorLines(
  lineStr: string,
  colorMap: Record<string, { bg: string; fg: string }>
): LineBadge[] {
  if (!lineStr) return [];

  const names = Object.keys(colorMap);
  const found: LineBadge[] = [];

  // Try splitting by known names
  for (const name of names) {
    if (lineStr.includes(name)) {
      const c = colorMap[name];
      found.push({ label: name, bg: c.bg, fg: c.fg });
    }
  }

  if (found.length > 0) return found;

  // Fallback
  return [{ label: lineStr, bg: "#666", fg: "#fff" }];
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Return all distinct line badges for a system, suitable for a filter UI.
 * Computed from the station data to only show lines that actually appear.
 */
export function getAllLinesForSystem(
  system: string,
  stationList: { line: string; name: string }[]
): LineBadge[] {
  const seen = new Set<string>();
  const result: LineBadge[] = [];

  for (const s of stationList) {
    const badges = getLineBadges(system, s.line, s.name);
    for (const b of badges) {
      if (!seen.has(b.label)) {
        seen.add(b.label);
        result.push(b);
      }
    }
  }

  // NYC uses official system ordering; other systems sort alphabetically
  if (system === "nyc") {
    const nycOrder = "A C E B D F M G L J Z N Q R W S 1 2 3 4 5 6 7".split(" ");
    return result.sort((a, b) => {
      const ai = nycOrder.indexOf(a.label);
      const bi = nycOrder.indexOf(b.label);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.label.localeCompare(b.label);
    });
  }

  return result.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Check if a station serves a given line label.
 */
export function stationHasLine(
  system: string,
  lineStr: string,
  stationName: string,
  lineLabel: string,
  routes?: string
): boolean {
  const badges = getLineBadges(system, lineStr, stationName, routes);
  return badges.some((b) => b.label === lineLabel);
}

export function getLineBadges(
  system: string,
  lineStr: string,
  stationName?: string,
  routes?: string
): LineBadge[] {
  switch (system) {
    case "nyc":
      return parseNycLine(lineStr, stationName, routes);

    case "wmata":
      return splitColorLines(lineStr, wmataLineColors);

    case "cta":
      return splitColorLines(lineStr, ctaLineColors);

    case "bart": {
      const cleaned = lineStr.replace(/\s*Line\b/g, "");
      const badges = splitColorLines(cleaned, bartLineColors);
      // Filter out "Oakland Airport Connector" noise
      return badges.filter((b) => b.label !== cleaned || !cleaned.includes("Oakland"));
    }

    case "mbta":
      return splitColorLines(lineStr, mbtaLineColors);

    case "septa": {
      if (lineStr.includes("Broad Street")) {
        return [{ label: "BSL", ...septaLineColors["BSL"] }];
      }
      if (lineStr.includes("Market") || lineStr.includes("Frankford")) {
        return [{ label: "MFL", ...septaLineColors["MFL"] }];
      }
      return [{ label: lineStr || "SEPTA", bg: "#666", fg: "#fff" }];
    }

    case "marta": {
      const lines = stationName ? martaStationLines[stationName] : null;
      if (lines) {
        return lines.map((l) => ({
          label: l,
          ...martaLineColors[l],
        }));
      }
      return lineStr
        ? splitColorLines(lineStr, martaLineColors)
        : [{ label: "MARTA", bg: "#CE8B3A", fg: "#fff" }];
    }
    
    case "gcrta": {
      const badges: LineBadge[] = [];
      if (lineStr.includes("Waterfront")) {
        badges.push({ label: "Waterfront", bg: "#3272B3", bg2: "#8FB63B", fg: "#fff" });
      }
      const remaining = lineStr.replace("Waterfront", "").replace(/^,|,$/g, "").trim();
      if (remaining) {
        badges.push(...splitColorLines(remaining, gcrtaLineColors));
      }
      return badges;
    }

    default:
      return lineStr
        ? [{ label: lineStr, bg: "#666", fg: "#fff" }]
        : [];
  }
}
