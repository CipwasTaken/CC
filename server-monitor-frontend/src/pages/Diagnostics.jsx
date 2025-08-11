import { useEffect, useState } from "react";
import api from "../api";
import dayjs from "dayjs";

export default function Diagnostics() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    cpu_usage: "",
    memory_usage: "",
    disk_usage: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const res = await api.get("/api/diagnostics");
    setRows(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      cpu_usage: Number(form.cpu_usage),
      memory_usage: Number(form.memory_usage),
      disk_usage: Number(form.disk_usage),
    };
    await api.post("/api/diagnostics", payload);
    setForm({ cpu_usage: "", memory_usage: "", disk_usage: "" });
    fetchRows();
  };

  return (
    <div className="card">
      <h2>Diagnostics</h2>

      <form className="controls" onSubmit={submit}>
        <input
          placeholder="CPU %"
          value={form.cpu_usage}
          onChange={(e) =>
            setForm((f) => ({ ...f, cpu_usage: e.target.value }))
          }
          required
        />
        <input
          placeholder="Memory %"
          value={form.memory_usage}
          onChange={(e) =>
            setForm((f) => ({ ...f, memory_usage: e.target.value }))
          }
          required
        />
        <input
          placeholder="Disk %"
          value={form.disk_usage}
          onChange={(e) =>
            setForm((f) => ({ ...f, disk_usage: e.target.value }))
          }
          required
        />
        <button type="submit">Add diagnostic</button>
        <button
          type="button"
          className="ghost"
          onClick={fetchRows}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Disk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{dayjs(r.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                <td>{r.cpu_usage}</td>
                <td>{r.memory_usage}</td>
                <td>{r.disk_usage}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: "var(--muted)" }}>
                  No diagnostics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
