import { useState, useMemo } from "react";
import { stations, systems, getAge, type Station } from "./data/stations";
import { getLineBadges } from "./data/lines";
import { usePostHog } from "@posthog/react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthMap(month: number): Map<number, Station[]> {
  const map = new Map<number, Station[]>();
  for (const s of stations) {
    const d = new Date(s.opened);
    if (d.getUTCMonth() + 1 === month) {
      const day = d.getUTCDate();
      const list = map.get(day) || [];
      list.push(s);
      map.set(day, list);
    }
  }
  return map;
}

function DayDetail({
  month,
  day,
  stations,
  onClose,
}: {
  month: number;
  day: number;
  stations: Station[];
  onClose: () => void;
}) {
  const grouped = useMemo(() => {
    const groups = new Map<string, Station[]>();
    for (const s of stations) {
      const key = `${s.system}:${s.opened}`;
      const list = groups.get(key) || [];
      list.push(s);
      groups.set(key, list);
    }
    return [...groups.entries()].sort((a, b) => {
      const sysA = a[1][0].system;
      const sysB = b[1][0].system;
      return sysA.localeCompare(sysB);
    });
  }, [stations]);

  return (
    <div className="day-detail-overlay" onClick={onClose}>
      <div className="day-detail" onClick={(e) => e.stopPropagation()}>
        <div className="day-detail-header">
          <h2>
            {MONTHS[month - 1]} {day}
          </h2>
          <span className="day-detail-count">
            {stations.length} station{stations.length === 1 ? "" : "s"}
          </span>
          <button className="day-detail-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="day-detail-body">
          {grouped.map(([key, group]) => {
            const sys = systems[group[0].system];
            const age = getAge(group[0].opened);
            const year = new Date(group[0].opened).getUTCFullYear();
            return (
              <div key={key} className="day-detail-group">
                <div
                  className="day-detail-group-header"
                  style={{ borderLeftColor: sys.color }}
                >
                  <span className="day-detail-group-emoji">{sys.emoji}</span>
                  <div>
                    <span className="day-detail-group-system">{sys.name}</span>
                    <span className="day-detail-group-meta">
                      {year} &middot; {age} years ago
                    </span>
                  </div>
                </div>
                <ul className="day-detail-stations">
                  {group.map((s, i) => {
                    const badges = getLineBadges(s.system, s.line, s.name, s.routes);
                    const isNyc = s.system === "nyc";
                    return (
                      <li key={i}>
                        <span className="day-detail-station-name">{s.name}</span>
                        {badges.length > 0 && (
                          <span className="day-detail-badges">
                            {badges.map((b, j) => (
                              <span
                                key={j}
                                className={`line-badge${isNyc ? " line-badge-round" : ""} line-badge-sm`}
                                style={{
                                  background: b.bg2 ? `linear-gradient(to bottom, ${b.bg} 50%, ${b.bg2} 50%)` : b.bg,
                                  color: b.fg,
                                }}
                              >
                                {b.label}
                              </span>
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const posthog = usePostHog();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthMap = useMemo(() => buildMonthMap(selectedMonth), [selectedMonth]);

  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, selectedMonth - 1, 1).getDay();

  const totalBirthdays = useMemo(() => {
    let total = 0;
    for (const list of monthMap.values()) total += list.length;
    return total;
  }, [monthMap]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const list of monthMap.values()) {
      if (list.length > max) max = list.length;
    }
    return max;
  }, [monthMap]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  function prevMonth() {
    const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    setSelectedMonth(newMonth);
    setSelectedDay(null);
    posthog?.capture("calendar_month_changed", { month: MONTHS[newMonth - 1], direction: "prev" });
  }

  function nextMonth() {
    const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    setSelectedMonth(newMonth);
    setSelectedDay(null);
    posthog?.capture("calendar_month_changed", { month: MONTHS[newMonth - 1], direction: "next" });
  }

  return (
    <div className="calendar-view">
      <div className="calendar-nav">
        <button onClick={prevMonth} className="calendar-arrow">&larr;</button>
        <h2 className="calendar-month-title">{MONTHS[selectedMonth - 1]}</h2>
        <button onClick={nextMonth} className="calendar-arrow">&rarr;</button>
      </div>
      <p className="calendar-summary">
        {totalBirthdays} station birthday{totalBirthdays === 1 ? "" : "s"} this
        month
      </p>

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="calendar-cell empty" />;
          }
          const dayStations = monthMap.get(day) || [];
          const count = dayStations.length;
          const isToday = selectedMonth === todayMonth && day === todayDay;
          const intensity =
            count > 0 && maxCount > 0
              ? Math.max(0.15, count / maxCount)
              : 0;

          return (
            <div
              key={day}
              className={`calendar-cell${count > 0 ? " has-birthdays" : ""}${isToday ? " is-today" : ""}${selectedDay === day ? " selected" : ""}`}
              onClick={count > 0 ? () => {
                setSelectedDay(day);
                posthog?.capture("calendar_day_selected", {
                  month: MONTHS[selectedMonth - 1],
                  day,
                  station_count: count,
                });
              } : undefined}
              style={
                count > 0
                  ? {
                      backgroundColor: `rgba(99, 102, 241, ${intensity * 0.25})`,
                    }
                  : undefined
              }
            >
              <span className="calendar-day-number">{day}</span>
              {count > 0 && (
                <div className="calendar-day-content">
                  {count <= 3 ? (
                    dayStations.map((s, j) => (
                      <span key={j} className="calendar-station-dot" title={s.name}>
                        {systems[s.system].emoji}
                      </span>
                    ))
                  ) : (
                    <span className="calendar-day-count">{count}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay !== null && monthMap.has(selectedDay) && (
        <DayDetail
          month={selectedMonth}
          day={selectedDay}
          stations={monthMap.get(selectedDay)!}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
