import { useEffect, useMemo, useState } from "react";
import api from "../api";
import dayjs from "dayjs";

const severities = ["All", "Critical", "Warning", "Info"];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("All");
  const [query, setQuery] = useState("");

  const fetchAlerts = async () => {
    setLoading(true);
    const res = await api.get("/api/alerts");
    setAlerts(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter(
      (a) =>
        (severity === "All" || a.severity === severity) &&
        (query.trim() === "" ||
          (a.type + " " + a.message)
            .toLowerCase()
            .includes(query.toLowerCase()))
    );
  }, [alerts, severity, query]);

  const resolve = async (id) => {
    await api.patch(`/api/alerts/${id}`);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const sendSampleBatch = async () => {
    const payload = [
      { type: "CPU Usage", message: "CPU over 90%", severity: "Critical" },
      {
        type: "Instance Launched",
        message: "EC2 i-0abc123 launched in us-west-2",
        severity: "Info",
      },
      {
        type: "Failed logins",
        message: "5 failed login attempts in 2 minutes",
        severity: "Warning",
      },
    ];
    await api.post("/api/alerts", payload);
    fetchAlerts();
  };

  return (
    <div className="card">
      <h2>Alerts</h2>

      <div className="controls">
        <input
          placeholder="Search type/message…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          {severities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="ghost" onClick={fetchAlerts} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <button onClick={sendSampleBatch}>Seed sample batch</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Message</th>
              <th>Severity</th>
              <th>Status</th>
              <th style={{ width: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{dayjs(a.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                <td>{a.type}</td>
                <td>{a.message}</td>
                <td>
                  <SeverityBadge level={a.severity} />
                </td>
                <td>{a.resolved ? "Resolved" : "Open"}</td>
                <td>
                  <button onClick={() => resolve(a.id)} disabled={a.resolved}>
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ color: "var(--muted)" }}>
                  No alerts match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeverityBadge({ level }) {
  const cls =
    level?.toLowerCase() === "critical"
      ? "badge critical"
      : level?.toLowerCase() === "warning"
      ? "badge warning"
      : level?.toLowerCase() === "info"
      ? "badge info"
      : "badge ok";
  return <span className={cls}>{level || "Unknown"}</span>;
}
