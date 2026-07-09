# Subway Party 🚇🎂

> I think we should know the birthdays of all public transit stops

So it was said on Discord, so it shall be.

This is a good vibes Claude Code repo, have fun! 😎

## Systems covered

*Initial data set scraped from Wikipedia*

- **New York City Subway** (347 stations, since 1904)
- **Chicago L** (108 stations, since 1892)
- **Washington Metro** (102 stations, since 1976)
- **MBTA / Boston** (56 stations, since 1897)
- **SEPTA / Philadelphia** (51 stations, since 1907)
- **BART / San Francisco** (50 stations, since 1972)
- **MARTA / Atlanta** (38 stations, since 1979)

## Features

**Today** — See which stations are celebrating a birthday today, plus a week of upcoming birthdays and aggregate stats.

**Browse** — Search, sort, and filter all stations. Filter by transit system, then narrow further by individual line. Sort by name or age, ascending or descending. 

**Calendar** — Month-by-month view. Click any day to see every station that opened on that date, grouped by system and year.

**Station cards** — Each card shows the station name, system, color-coded line badges, opening date, and age. Hover to reveal links to the station's Wikipedia article and Google Maps location.

## Data sources

Station data is primarily scraped from Wikipedia list articles using the scripts in `scripts/`. The scraper extracts station names, lines, opening dates, and Wikipedia article links from wikitables. A second pass fetches geographic coordinates from the Wikipedia API for direct map links.

MBTA and SEPTA opening dates are not available in their respective Wikipedia list tables, so those stations are maintained manually in `scripts/generate-stations-ts.mjs`.

## Development

```sh
npm install
npm run dev        # Start dev server at localhost:5173
npm run build      # Type-check and build for production
```

### Analytics (optional)

The app uses [PostHog](https://posthog.com) for usage analytics. It's optional — with no token set, PostHog silently no-ops and the app runs normally with no analytics collected. To enable it, copy `.env.example` to `.env.local` and fill in your PostHog project token.

### Refreshing station data

```sh
node scripts/scrape-wikipedia.mjs > scripts/scraped-stations.json
node scripts/generate-stations-ts.mjs > src/data/stations.ts
```

The first command scrapes Wikipedia for NYC, WMATA, CTA, BART, and MARTA stations. The second merges the scraped data with manual MBTA/SEPTA entries, fetches coordinates from the Wikipedia API, and generates the TypeScript data file.

## Built with

React, TypeScript, Vite. No UI framework — just CSS custom properties and a light/dark theme via `prefers-color-scheme`. Data scraping uses Cheerio.
