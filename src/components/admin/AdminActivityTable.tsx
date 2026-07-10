import { useMemo, useState } from "react";
import type { AdminActivityEvent } from "../../services/adminAnalytics";

type AdminActivityTableProps = {
  events: AdminActivityEvent[];
};

type SortKey = "actor" | "event" | "target" | "ipAddress" | "time";
type SortDirection = "ascending" | "descending";

const columns: { key: SortKey; label: string }[] = [
  { key: "actor", label: "Actor" },
  { key: "event", label: "Event" },
  { key: "target", label: "Target" },
  { key: "ipAddress", label: "IP address" },
  { key: "time", label: "Time" },
];

function formatTime(timestamp: number) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function AdminActivityTable({ events }: AdminActivityTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("descending");
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchingEvents = normalizedQuery ? events.filter((event) => {
      return [event.actor, event.event, event.target, event.ipAddress, event.userAgent]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    }) : events;

    return [...matchingEvents].sort((first, second) => {
      const comparison = sortKey === "time"
        ? first.time - second.time
        : first[sortKey].localeCompare(second[sortKey], undefined, { sensitivity: "base" });

      return sortDirection === "ascending" ? comparison : -comparison;
    });
  }, [events, query, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === "ascending" ? "descending" : "ascending");
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "time" ? "descending" : "ascending");
  };

  return (
    <div className="admin-activity-table">
      <div className="admin-activity-header">
        <div>
          <h3>Today's Activity</h3>
          <p>Search and review login audit events.</p>
        </div>
        <label>
          <span className="sr-only">Search activity</span>
          <input
            type="search"
            placeholder="Search activity..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="admin-activity-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  aria-sort={sortKey === column.key ? sortDirection : "none"}
                >
                  <button type="button" className="admin-sort-button" onClick={() => changeSort(column.key)}>
                    <span>{column.label}</span>
                    <span className="admin-sort-indicator" aria-hidden="true">
                      {sortKey === column.key ? (sortDirection === "ascending" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <tr key={`${event.event}-${event.time}-${index}`}>
                  <td>{event.actor}</td>
                  <td>{event.event}</td>
                  <td>{event.target}</td>
                  <td>{event.ipAddress}</td>
                  <td>{formatTime(event.time)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No activity found for today.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-activity-footer">
        <span>{filteredEvents.length} of {events.length}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
