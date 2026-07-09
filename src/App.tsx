import { useState, useMemo } from "react";
import {
  stations,
  systems,
  getTodaysBirthdays,
  getUpcomingBirthdays,
  getAge,
  getStationsBySystem,
  type Station,
} from "./data/stations";
import Calendar from "./Calendar";
import HeroBackground from "./HeroBackground";
import { getLineBadges, getAllLinesForSystem, stationHasLine } from "./data/lines";
import wikipediaW from "./assets/wikipedia-w.svg";
import "./App.css";
import { usePostHog } from "@posthog/react";

function LineBadges({ system, line, stationName, routes }: { system: string; line: string; stationName: string; routes?: string }) {
  const badges = getLineBadges(system, line, stationName, routes);
  if (badges.length === 0) return null;

  const isNyc = system === "nyc";

  return (
    <div className="line-badges">
      {badges.map((b, i) => (
        <span
          key={i}
          className={`line-badge${isNyc ? " line-badge-round" : ""}`}
          style={{
            background: b.bg2 ? `linear-gradient(to bottom, ${b.bg} 50%, ${b.bg2} 50%)` : b.bg,
            color: b.fg,
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

const numChunk = /(\d+)/;
function naturalCompare(a: string, b: string): number {
  const aParts = a.split(numChunk);
  const bParts = b.split(numChunk);
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    if (aParts[i] !== bParts[i]) {
      const aNum = Number(aParts[i]);
      const bNum = Number(bParts[i]);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return aParts[i].localeCompare(bParts[i]);
    }
  }
  return aParts.length - bParts.length;
}

function stationWikiUrl(station: Station): string {
  if (station.wiki) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(station.wiki)}`;
  }
  const q = `${station.name} station ${systems[station.system].city}`;
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`;
}

function stationMapUrl(station: Station): string {
  if (station.coords) {
    return `https://www.google.com/maps/search/?api=1&query=${station.coords[0]},${station.coords[1]}`;
  }
  const label = station.wiki?.replace(/_/g, " ") || `${station.name} station ${systems[station.system].city}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(label)}`;
}

function StationCard({ station }: { station: Station }) {
  const posthog = usePostHog();
  const age = getAge(station.opened);
  const sys = systems[station.system];
  const opened = new Date(station.opened);
  const formattedDate = opened.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="station-card" style={{ borderLeftColor: sys.color }}>
      <div className="station-header">
        <span className="station-emoji">{sys.emoji}</span>
        <div>
          <h3 className="station-name">{station.name}</h3>
          <span className="station-system">{sys.name}</span>
        </div>
      </div>
      <LineBadges system={station.system} line={station.line} stationName={station.name} routes={station.routes} />
      <div className="station-details">
        <span className="station-date">Born {formattedDate}</span>
        <span className="station-age">{age} years old</span>
      </div>
      <div className="station-links">
        <a
          href={stationWikiUrl(station)}
          target="_blank"
          rel="noopener noreferrer"
          title="Wikipedia"
          className="station-link"
          onClick={() =>
            posthog?.capture("station_wiki_link_clicked", {
              station_name: station.name,
              transit_system: station.system,
              station_age_years: age,
            })
          }
        >
          <img src={wikipediaW} alt="Wikipedia" width="14" height="14" />
        </a>
        <a
          href={stationMapUrl(station)}
          target="_blank"
          rel="noopener noreferrer"
          title="View on map"
          className="station-link"
          onClick={() =>
            posthog?.capture("station_map_link_clicked", {
              station_name: station.name,
              transit_system: station.system,
              station_age_years: age,
            })
          }
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

function BirthdaySection({
  title,
  subtitle,
  stations,
}: {
  title: string;
  subtitle?: string;
  stations: Station[];
}) {
  if (stations.length === 0) return null;
  return (
    <section className="birthday-section">
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <div className="station-grid">
        {stations.map((s, i) => (
          <StationCard key={`${s.system}-${s.name}-${i}`} station={s} />
        ))}
      </div>
    </section>
  );
}

type View = "today" | "browse" | "calendar";

function App() {
  const posthog = usePostHog();
  const [view, setView] = useState<View>("today");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "age">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const todaysBirthdays = useMemo(
    () => getTodaysBirthdays(month, day),
    [month, day]
  );
  const upcomingBirthdays = useMemo(
    () => getUpcomingBirthdays(month, day, 7),
    [month, day]
  );

  const systemStations = useMemo(() => {
    if (!selectedSystem) return stations;
    return getStationsBySystem(selectedSystem);
  }, [selectedSystem]);

  const availableLines = useMemo(() => {
    if (!selectedSystem) return [];
    return getAllLinesForSystem(selectedSystem, systemStations);
  }, [selectedSystem, systemStations]);

  const browseStations = useMemo(() => {
    let filtered = systemStations;

    // Line filter
    if (selectedLine && selectedSystem) {
      filtered = filtered.filter((s) =>
        stationHasLine(s.system, s.line, s.name, selectedLine, s.routes)
      );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return naturalCompare(a.name, b.name);
      } else {
        const ageA = new Date(a.opened).getTime();
        const ageB = new Date(b.opened).getTime();
        return ageA - ageB; // oldest first for asc
      }
    });

    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [systemStations, selectedLine, selectedSystem, searchQuery, sortBy, sortDir]);


  const todayFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app">
      <HeroBackground />
      <header className="app-header">
        <h1>
          <span className="logo-icon">🚇</span> Subway Party 🎂
        </h1>
        <p className="tagline">
          I think we should know the birthdays of all public transit stops
        </p>
        <nav className="nav">
          <button
            className={view === "today" ? "active" : ""}
            onClick={() => {
              setView("today");
              posthog?.capture("tab_switched", { tab: "today" });
            }}
          >
            Today
          </button>
          <button
            className={view === "browse" ? "active" : ""}
            onClick={() => {
              setView("browse");
              posthog?.capture("tab_switched", { tab: "browse" });
            }}
          >
            Browse
          </button>
          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => {
              setView("calendar");
              posthog?.capture("tab_switched", { tab: "calendar" });
            }}
          >
            Calendar
          </button>
        </nav>
      </header>

      <main>
        {view === "today" && (
          <>
            <div className="today-header">
              <h2 className="today-date">{todayFormatted}</h2>
            </div>
            {todaysBirthdays.length > 0 ? (
              <BirthdaySection
                title={`🎂 Happy Birthday to ${todaysBirthdays.length} station${todaysBirthdays.length === 1 ? "" : "s"}!`}
                stations={todaysBirthdays}
              />
            ) : (
              <div className="no-birthdays">
                <p className="no-birthdays-emoji">🎈</p>
                <p>No station birthdays today.</p>
                <p className="no-birthdays-sub">
                  But there are {stations.length} birthdays in our database
                  waiting to be celebrated!
                </p>
              </div>
            )}
            <BirthdaySection
              title="🔜 Coming up this week"
              stations={upcomingBirthdays}
            />
            <section className="stats">
              <h2>By the numbers</h2>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-number">{stations.length}</span>
                  <span className="stat-label">Stations tracked</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {Object.keys(systems).length}
                  </span>
                  <span className="stat-label">Transit systems</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {Math.max(...stations.map((s) => getAge(s.opened)))}
                  </span>
                  <span className="stat-label">Oldest (years)</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {Math.min(...stations.map((s) => getAge(s.opened)))}
                  </span>
                  <span className="stat-label">Youngest (years)</span>
                </div>
              </div>
            </section>
          </>
        )}

        {view === "browse" && (
          <>
            <div className="system-filter">
              <button
                className={selectedSystem === null ? "active" : ""}
                onClick={() => {
                  setSelectedSystem(null);
                  setSelectedLine(null);
                  posthog?.capture("system_filter_selected", { transit_system: null });
                }}
              >
                All Systems
              </button>
              {Object.entries(systems).map(([id, sys]) => (
                <button
                  key={id}
                  className={selectedSystem === id ? "active" : ""}
                  onClick={() => {
                    setSelectedSystem(id);
                    setSelectedLine(null);
                    posthog?.capture("system_filter_selected", { transit_system: id, system_name: sys.name });
                  }}
                  style={
                    selectedSystem === id
                      ? { backgroundColor: sys.color, borderColor: sys.color }
                      : {}
                  }
                >
                  {sys.emoji} {sys.name}
                </button>
              ))}
            </div>

            {availableLines.length > 0 && (
              <div className="line-filter">
                <button
                  className={selectedLine === null ? "active" : ""}
                  onClick={() => {
                    setSelectedLine(null);
                    posthog?.capture("line_filter_selected", { line: null, transit_system: selectedSystem });
                  }}
                >
                  All Lines
                </button>
                {availableLines.map((lb) => {
                  // Parse hex color to rgb for alpha
                  const hex = lb.bg.replace("#", "");
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  const hoverBg = lb.bg2
                    ? (() => {
                        const hex2 = lb.bg2.replace("#", "");
                        const r2 = parseInt(hex2.substring(0, 2), 16);
                        const g2 = parseInt(hex2.substring(2, 4), 16);
                        const b2 = parseInt(hex2.substring(4, 6), 16);
                        return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.2) 50%, rgba(${r2}, ${g2}, ${b2}, 0.2) 50%)`;
                      })()
                    : `rgba(${r}, ${g}, ${b}, 0.2)`;
                  const bgValue = lb.bg2  ? `linear-gradient(to bottom, ${lb.bg} 50%, ${lb.bg2} 50%)` : lb.bg;

                  return (
                    <button
                      key={lb.label}
                      className={`line-filter-btn${selectedLine === lb.label ? " active" : ""}`}
                      onClick={() => {
                        const newLine = selectedLine === lb.label ? null : lb.label;
                        setSelectedLine(newLine);
                        posthog?.capture("line_filter_selected", { line: newLine, transit_system: selectedSystem });
                      }}
                      style={
                        selectedLine === lb.label
                          ? { background: bgValue, borderColor: lb.bg, color: lb.fg }
                          : { borderColor: lb.bg, "--line-hover-bg": hoverBg } as React.CSSProperties
                      }
                    >
                      {lb.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="browse-controls">
              <input
                type="text"
                className="search-input"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 3) {
                    posthog?.capture("station_searched", { query: e.target.value.trim(), transit_system: selectedSystem });
                  }
                }}
              />
              <div className="sort-controls">
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    const newSortBy = e.target.value as "name" | "age";
                    setSortBy(newSortBy);
                    posthog?.capture("sort_changed", { sort_by: newSortBy, sort_direction: sortDir });
                  }}
                >
                  <option value="name">Name</option>
                  <option value="age">Age</option>
                </select>
                <button
                  className="sort-dir-btn"
                  onClick={() => {
                    const newDir = sortDir === "asc" ? "desc" : "asc";
                    setSortDir(() => newDir);
                    posthog?.capture("sort_changed", { sort_by: sortBy, sort_direction: newDir });
                  }}
                  title={sortDir === "asc" ? "Ascending" : "Descending"}
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {browseStations.length > 0 ? (
              <BirthdaySection
                title={
                  selectedSystem
                    ? `${systems[selectedSystem].emoji} ${systems[selectedSystem].name}`
                    : "All Stations"
                }
                subtitle={`${browseStations.length} station${browseStations.length === 1 ? "" : "s"}`}
                stations={browseStations}
              />
            ) : (
              <div className="no-birthdays">
                <p className="no-birthdays-emoji">🔍</p>
                <p>No stations found.</p>
                <p className="no-birthdays-sub">
                  Try a different search or filter combination.
                </p>
              </div>
            )}
          </>
        )}

        {view === "calendar" && <Calendar />}
      </main>

      <footer>
        <p>
          Subway Party tracks the opening dates of public transit stations
          across the US.
        </p>
        <p className="footer-note">
          Data sourced from transit authority records. Some dates are
          approximate.
        </p>
        <p className="footer-note">
          <a
            href="https://github.com/ecormany/subway-party"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
