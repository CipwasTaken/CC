import { useEffect, useMemo, useState } from "react";
import api from "../api";
import dayjs from "dayjs";

const LEVELS = ["All", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];

// build a query string from an object (skips empty values)
const qs = (params) =>
  Object.entries(params)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

export default function Logs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("All");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [auto, setAuto] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const params = {};
    if (level !== "All") params.level = level;
    if (source.trim()) params.source = source.trim();
    if (q.trim()) params.q = q.trim();
    const res = await api.get("/api/logs", { params });
    setRows(res.data || []);
    setLoading(false);
  };

  // NEW: export currently-filtered logs as CSV via backend
  const exportCsv = () => {
    const params = {};
    if (level !== "All") params.level = level;
    if (source.trim()) params.source = source.trim();
    if (q.trim()) params.q = q.trim();

    const base = (api.defaults?.baseURL || "").replace(/\/$/, "");
    const url = `${base}/api/logs/export${Object.keys(params).length ? "?" + qs(params) : ""}`;
    window.open(url, "_blank"); // triggers a file download
  };

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(fetchLogs, 5000);
    return () => clearInterval(id);
  }, [auto, level, source, q]);

  const sources = useMemo(() => {
    const s = new Set(rows.map(r => r.source).filter(Boolean));
    return ["", ...Array.from(s)];
  }, [rows]);

  return (
    <div className="card">
      <h2>Logs</h2>

      <div className="controls">
        <select value={level} onChange={e => setLevel(e.target.value)}>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={source} onChange={e => setSource(e.target.value)}>
          {sources.map(s => <option key={s} value={s}>{s || "All sources"}</option>)}
        </select>
        <input placeholder="Search message/context…" value={q} onChange={e => setQ(e.target.value)} />
        <button className="ghost" onClick={fetchLogs} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <button onClick={() => setAuto(a => !a)}>{auto ? "Auto (5s)" : "Manual"}</button>
        {/* NEW: Export CSV */}
        <button onClick={exportCsv}>Export CSV</button>
      </div>

      <div style={{overflowX: "auto"}}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Source</th>
              <th>Level</th>
              <th>Message</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{dayjs(r.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                <td>{r.source || "—"}</td>
                <td><LevelBadge level={r.level} /></td>
                <td style={{whiteSpace:"pre-wrap"}}>{r.message}</td>
                <td style={{whiteSpace:"pre-wrap", color:"var(--muted)"}}>{r.context || ""}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="5" style={{color:"var(--muted)"}}>No logs match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const l = (level || "").toUpperCase();
  const cls =
    l === "CRITICAL" ? "badge critical" :
    l === "ERROR"    ? "badge critical" :
    l === "WARNING"  ? "badge warning"  :
    l === "INFO"     ? "badge info"     : "badge ok";
  return <span className={cls}>{l || "UNKNOWN"}</span>;
}
