import { useMemo, useState } from "react";
import type { AdminVisitorDevice } from "../../services/adminAnalytics";

type AdminVisitorDevicesProps = {
  devices: AdminVisitorDevice[];
  isLoading: boolean;
};

type SortKey = "browser" | "location" | "screen" | "network" | "firstSeen" | "lastSeen" | "isActive";
type SortDirection = "ascending" | "descending";

const columns: { key: SortKey; label: string }[] = [
  { key: "browser", label: "Device" },
  { key: "location", label: "Location" },
  { key: "screen", label: "Screen" },
  { key: "network", label: "Network" },
  { key: "firstSeen", label: "First visit" },
  { key: "lastSeen", label: "Last visit" },
  { key: "isActive", label: "Status" },
];

function formatDate(timestamp: number) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function AdminVisitorDevices({ devices, isLoading }: AdminVisitorDevicesProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastSeen");
  const [sortDirection, setSortDirection] = useState<SortDirection>("descending");

  const visibleDevices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingDevices = normalizedQuery ? devices.filter((device) => {
      return [
        device.browser,
        device.platform,
        device.location,
        device.ipAddress,
        device.screen,
        device.network,
        device.language,
        device.timezone,
      ].join(" ").toLowerCase().includes(normalizedQuery);
    }) : devices;

    return [...matchingDevices].sort((first, second) => {
      const firstValue = first[sortKey];
      const secondValue = second[sortKey];
      let comparison: number;

      if (typeof firstValue === "string" && typeof secondValue === "string") {
        comparison = firstValue.localeCompare(secondValue, undefined, { sensitivity: "base" });
      } else if (typeof firstValue === "boolean" && typeof secondValue === "boolean") {
        comparison = Number(firstValue) - Number(secondValue);
      } else {
        comparison = Number(firstValue) - Number(secondValue);
      }

      return sortDirection === "ascending" ? comparison : -comparison;
    });
  }, [devices, query, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === "ascending" ? "descending" : "ascending");
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "firstSeen" || nextKey === "lastSeen" ? "descending" : "ascending");
  };

  return (
    <div className="admin-devices-view mx-auto max-w-6xl">
      <header className="admin-dashboard-header">
        <div>
          <p className="metadata text-neutral-500 dark:text-neutral-500">Viewers</p>
          <h1>Visitor Devices</h1>
        </div>
        <span className={`admin-device-count ${isLoading ? "is-loading" : ""}`}>
          {isLoading ? "Loading devices" : `${devices.length.toLocaleString()} devices`}
        </span>
      </header>

      {isLoading ? (
        <AdminDeviceTableSkeleton />
      ) : (
        <div className="admin-activity-table admin-device-table">
          <div className="admin-activity-header">
            <div>
              <h3>All devices</h3>
              <p>Search and sort the devices that visited your portfolio.</p>
            </div>
            <label>
              <span className="sr-only">Search visitor devices</span>
              <input
                type="search"
                placeholder="Search devices..."
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
                    <th key={column.key} aria-sort={sortKey === column.key ? sortDirection : "none"}>
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
                {visibleDevices.length > 0 ? visibleDevices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <strong>{device.browser}</strong>
                      <small>{device.platform} · {device.language}</small>
                    </td>
                    <td>
                      <strong>{device.location}</strong>
                      <small>{device.ipAddress} · {device.timezone}</small>
                    </td>
                    <td>{device.screen}</td>
                    <td>{device.network.toUpperCase()}</td>
                    <td>{formatDate(device.firstSeen)}</td>
                    <td>{formatDate(device.lastSeen)}</td>
                    <td>
                      <span className={`admin-device-status ${device.isActive ? "is-active" : ""}`}>
                        <i aria-hidden="true" />
                        {device.isActive ? "Active" : "Offline"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7}>No visitor devices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-activity-footer">
            <span>{visibleDevices.length} of {devices.length}</span>
            <span>List mode</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDeviceTableSkeleton() {
  return (
    <div className="admin-activity-table admin-device-table admin-device-skeleton" role="status" aria-busy="true">
      <span className="sr-only">Loading visitor devices</span>
      <div className="admin-activity-header" aria-hidden="true">
        <div>
          <h3>All devices</h3>
          <p>Preparing the latest visitor details...</p>
        </div>
        <span className="admin-device-skeleton-search" />
      </div>

      <div className="admin-activity-scroll" aria-hidden="true">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td><SkeletonLines secondary /></td>
                <td><SkeletonLines secondary /></td>
                <td><SkeletonLines /></td>
                <td><SkeletonLines short /></td>
                <td><SkeletonLines /></td>
                <td><SkeletonLines /></td>
                <td><SkeletonLines short /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-activity-footer" aria-hidden="true">
        <span className="admin-device-skeleton-line is-footer" />
        <span className="admin-device-skeleton-line is-footer is-short" />
      </div>
    </div>
  );
}

function SkeletonLines({ secondary = false, short = false }: { secondary?: boolean; short?: boolean }) {
  return (
    <span className={`admin-device-skeleton-lines ${short ? "is-short" : ""}`}>
      <span className="admin-device-skeleton-line" />
      {secondary ? <span className="admin-device-skeleton-line is-secondary" /> : null}
    </span>
  );
}
