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
import { getLineBadges } from "./data/lines";
import "./App.css";

function LineBadges({ system, line, stationName }: { system: string; line: string; stationName: string }) {
  const badges = getLineBadges(system, line, stationName);
  if (badges.length === 0) return null;

  const isNyc = system === "nyc";

  return (
    <div className="line-badges">
      {badges.map((b, i) => (
        <span
          key={i}
          className={`line-badge${isNyc ? " line-badge-round" : ""}`}
          style={{ backgroundColor: b.bg, color: b.fg }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function StationCard({ station }: { station: Station }) {
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
      <LineBadges system={station.system} line={station.line} stationName={station.name} />
      <div className="station-details">
        <span className="station-date">Born {formattedDate}</span>
        <span className="station-age">{age} years old</span>
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
  const [view, setView] = useState<View>("today");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
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

  const browseStations = useMemo(() => {
    if (!selectedSystem) return stations;
    return getStationsBySystem(selectedSystem);
  }, [selectedSystem]);


  const todayFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="logo-icon">🚇</span> Subway Party
        </h1>
        <p className="tagline">Every transit stop has a birthday</p>
        <nav className="nav">
          <button
            className={view === "today" ? "active" : ""}
            onClick={() => setView("today")}
          >
            Today
          </button>
          <button
            className={view === "browse" ? "active" : ""}
            onClick={() => setView("browse")}
          >
            Browse
          </button>
          <button
            className={view === "calendar" ? "active" : ""}
            onClick={() => setView("calendar")}
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
                onClick={() => setSelectedSystem(null)}
              >
                All Systems
              </button>
              {Object.entries(systems).map(([id, sys]) => (
                <button
                  key={id}
                  className={selectedSystem === id ? "active" : ""}
                  onClick={() => setSelectedSystem(id)}
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
            <BirthdaySection
              title={
                selectedSystem
                  ? `${systems[selectedSystem].emoji} ${systems[selectedSystem].name}`
                  : "All Stations"
              }
              subtitle={`${browseStations.length} stations`}
              stations={browseStations}
            />
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
      </footer>
    </div>
  );
}

export default App;
