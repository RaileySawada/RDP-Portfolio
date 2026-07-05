import { useMemo, useState } from "react";
import type { AdminActivityEvent } from "../../services/adminAnalytics";

type AdminActivityTableProps = {
  events: AdminActivityEvent[];
};

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
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) => {
      return [event.actor, event.event, event.target, event.ipAddress, event.userAgent]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [events, query]);

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
              <th>Actor</th>
              <th>Event</th>
              <th>Target</th>
              <th>IP address</th>
              <th>Time</th>
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
