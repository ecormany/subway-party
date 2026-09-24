import * as cheerio from "cheerio";

const SYSTEMS = [
  {
    id: "nyc",
    article: "List_of_New_York_City_Subway_stations",
    nameCol: "Station",
    lineCol: "Line",
    openedCol: "Opened",
  },
  {
    id: "wmata",
    article: "List_of_Washington_Metro_stations",
    nameCol: "Station",
    lineCol: "Lines",
    openedCol: "Opened",
    useTemplateLines: true,
  },
  {
    id: "cta",
    article: 'List_of_Chicago_"L"_stations',
    nameCol: "Station",
    lineCol: "Lines",
    openedCol: "Opened",
  },
  {
    id: "bart",
    article: "List_of_Bay_Area_Rapid_Transit_stations",
    nameCol: "Station",
    lineCol: "Line",
    openedCol: "Opened",
  },
  {
    id: "marta",
    article: "List_of_MARTA_stations",
    nameCol: "Station",
    lineCol: "Lines",
    openedCol: "Opened",
  },
  {
    id: "stm",
    article: "List_of_Montreal_Metro_stations",
    nameCol: "Name",
    lineCol: "Line",
    openedCol: "Opened",
    lineFromLinkTitles: true,
  },
  {
    id: "lu",
    article: "List_of_London_Underground_stations",
    nameCol: "Station",
    lineCol: "Line",
    openedCol: "Opened",
    linkLines: true,
    disambiguateByWiki: true,
  },
];

async function fetchWikiHTML(article) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(article)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SubwayParty/1.0 (transit birthday tracker)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${article}: ${res.status}`);
  return res.text();
}

/**
 * Extract line names from Wikipedia's data-mw template params.
 * Used for WMATA and similar systems where lines are rendered as color icons
 * via templates like {{Rint|Washington|Red}}.
 */
function extractTemplateLines(el, $) {
  const lineNames = [];
  $(el).find("[data-mw]").each((_, dmEl) => {
    try {
      const dm = JSON.parse($(dmEl).attr("data-mw") || "{}");
      const parts = dm.parts || [];
      for (const p of parts) {
        if (p?.template?.params?.["2"]?.wt) {
          lineNames.push(p.template.params["2"].wt);
        }
      }
    } catch {}
  });
  return lineNames.length > 0 ? lineNames.join(", ") : "";
}

/**
 * Extract line names from the `title` attribute of links inside a cell.
 * Used for systems like Montreal, where lines are rendered as icons
 * (via a template like {{rint|montreal|metro|1}}) linking to an article
 * titled e.g. "Green Line (Montreal Metro)" — the template params don't
 * carry the color name directly, but the link title does.
 */
function extractLinkTitleLines(el, $) {
  const lineNames = [];
  $(el)
    .find("a[title]")
    .each((_, a) => {
      const title = $(a).attr("title") || "";
      const m = title.match(/^(\w[\w\s]*?)\s+Line\s*\(/);
      if (m) lineNames.push(m[1].trim());
    });
  return lineNames.length > 0 ? lineNames.join(", ") : "";
}

/**
 * Extract line names from the links in a cell, one per line. Used for London
 * Underground, where lines are a mix of <li> lists and <br>-separated links,
 * so plain text extraction runs them together ("DistrictPiccadilly").
 */
function extractLinkLines(el, $) {
  $(el).find("sup").remove();
  return $(el)
    .find("a")
    .toArray()
    .map((a) => cleanText(a, $))
    .filter(Boolean)
    .join(", ");
}

function cleanText(el, $) {
  $(el).find("sup").remove();
  $(el).find("style").remove();
  return $(el)
    .text()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[​‌‍﻿]/g, "") // zero-width chars
    .replace(/[†ⓉⒷ♿✦●★◆▲■⬤*^]/g, "")          // Wikipedia annotation symbols
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(text) {
  // Clean up the text
  let cleaned = text
    .replace(/\[.*?\]/g, "") // remove [citation] brackets
    .replace(/\(.*?\)/g, "") // remove parenthetical notes
    .replace(/;.*$/, "") // take first date if semicolon-separated
    .replace(/,\s*originally.*$/i, "")
    .trim();

  // Try "Month Day, Year" format
  const mdyMatch = cleaned.match(
    /([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})/
  );
  if (mdyMatch) {
    const d = new Date(`${mdyMatch[1]} ${mdyMatch[2]}, ${mdyMatch[3]}`);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }

  // Try "Day Month Year"
  const dmyMatch = cleaned.match(
    /(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})/
  );
  if (dmyMatch) {
    const d = new Date(`${dmyMatch[2]} ${dmyMatch[1]}, ${dmyMatch[3]}`);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }

  // Try just a year
  const yearMatch = cleaned.match(/(\d{4})/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  return null;
}

function findColumnIndices($, table, config) {
  const headers = [];
  $(table)
    .find("tr")
    .first()
    .find("th")
    .each((i, th) => {
      headers.push(cleanText(th, $).toLowerCase());
    });

  // If first row didn't have headers, check thead
  if (headers.length === 0) {
    $(table)
      .find("thead tr")
      .first()
      .find("th")
      .each((i, th) => {
        headers.push(cleanText(th, $).toLowerCase());
      });
  }

  const nameIdx = headers.findIndex((h) =>
    h.includes(config.nameCol.toLowerCase())
  );
  const lineIdx = headers.findIndex((h) =>
    h.includes(config.lineCol.toLowerCase())
  );
  const openedIdx = headers.findIndex((h) =>
    h.includes(config.openedCol.toLowerCase())
  );

  return { nameIdx, lineIdx, openedIdx, headers };
}

function expandRowspans($, table) {
  // Pre-process: expand rowspan cells so each row has its own values
  const rows = $(table).find("tr").toArray();
  const grid = [];

  for (let r = 0; r < rows.length; r++) {
    if (!grid[r]) grid[r] = [];
    const cells = $(rows[r]).find("td, th").toArray();
    let cellIdx = 0;

    for (let c = 0; cellIdx < cells.length || c < 50; c++) {
      if (grid[r][c] !== undefined) continue;
      if (cellIdx >= cells.length) break;

      const cell = cells[cellIdx];
      const rowspan = parseInt($(cell).attr("rowspan") || "1", 10);
      const colspan = parseInt($(cell).attr("colspan") || "1", 10);

      for (let dr = 0; dr < rowspan; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          if (!grid[r + dr]) grid[r + dr] = [];
          grid[r + dr][c + dc] = cell;
        }
      }
      cellIdx++;
    }
  }

  return grid;
}

async function scrapeSystem(config) {
  console.error(`Scraping ${config.id}...`);
  const html = await fetchWikiHTML(config.article);
  const $ = cheerio.load(html);

  // Find the main sortable/wikitable tables
  const tables = $("table.wikitable").toArray();
  if (tables.length === 0) {
    console.error(`  No wikitable found for ${config.id}`);
    return [];
  }

  const stations = [];

  for (const table of tables) {
    const { nameIdx, lineIdx, openedIdx, headers } = findColumnIndices(
      $,
      table,
      config
    );

    if (nameIdx === -1 || openedIdx === -1) {
      continue;
    }

    console.error(
      `  Found table with columns: ${headers.join(", ")}`
    );
    console.error(
      `  name=${nameIdx}, line=${lineIdx}, opened=${openedIdx}`
    );

    const grid = expandRowspans($, table);

    // Skip header row(s)
    for (let r = 1; r < grid.length; r++) {
      const row = grid[r];
      if (!row || !row[nameIdx] || !row[openedIdx]) continue;

      // Skip if this is a pure header row (all cells are th)
      const rowCells = row.filter(Boolean);
      if (rowCells.length > 0 && rowCells.every((c) => c.tagName === "th")) continue;

      const name = cleanText(row[nameIdx], $);
      const nameLink = $(row[nameIdx]).find("a[href]").first();
      const href = nameLink.attr("href") || "";
      const wiki = href.startsWith("./") ? href.slice(2) : "";
      let line = lineIdx >= 0 && row[lineIdx] ? cleanText(row[lineIdx], $) : "";
      // For systems using color-icon templates (e.g. WMATA), extract from data-mw
      if (config.useTemplateLines && lineIdx >= 0 && row[lineIdx]) {
        const tmplLine = extractTemplateLines(row[lineIdx], $);
        if (tmplLine) line = tmplLine;
      }
      if (config.lineFromLinkTitles && lineIdx >= 0 && row[lineIdx]) {
        const linkLine = extractLinkTitleLines(row[lineIdx], $);
        if (linkLine) line = linkLine;
      }
      // For systems with one link per line in the cell (e.g. London Underground)
      if (config.linkLines && lineIdx >= 0 && row[lineIdx]) {
        const linkLine = extractLinkLines(row[lineIdx], $);
        if (linkLine) line = linkLine;
      }
      const openedText =  cleanText(row[openedIdx], $);
      const opened = parseDate(openedText);

      if (!name || !opened) continue;

      // Skip "future" or "under construction" stations
      if (
        openedText.toLowerCase().includes("under construction") ||
        openedText.toLowerCase().includes("planned") ||
        openedText.toLowerCase().includes("tbd")
      ) {
        continue;
      }

      const entry = { name, system: config.id, line, opened };
      if (wiki) entry.wiki = decodeURIComponent(wiki);
      stations.push(entry);
    }
  }

  // Some systems list distinct stations that share a name (e.g. London's two
  // Edgware Road stations). Tell them apart using the Wikipedia article's
  // parenthetical, e.g. "Edgware Road (Bakerloo line)".
  if (config.disambiguateByWiki) {
    const counts = {};
    for (const s of stations) counts[s.name] = (counts[s.name] || 0) + 1;
    for (const s of stations) {
      const paren = s.wiki?.match(/_\(([^)]+)\)$/);
      if (counts[s.name] > 1 && paren) {
        s.name = `${s.name} (${paren[1].replace(/_/g, " ")})`;
      }
    }
  }

  console.error(`  Found ${stations.length} stations for ${config.id}`);
  return stations;
}

async function main() {
  const allStations = [];

  for (const config of SYSTEMS) {
    try {
      const stations = await scrapeSystem(config);
      allStations.push(...stations);
    } catch (err) {
      console.error(`Error scraping ${config.id}: ${err.message}`);
    }
  }

  // Deduplicate by name+system
  const seen = new Set();
  const unique = allStations.filter((s) => {
    const key = `${s.system}:${s.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.error(`\nTotal unique stations: ${unique.length}`);

  // Output as JSON
  console.log(JSON.stringify(unique, null, 2));
}

main().catch(console.error);
