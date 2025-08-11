import { useEffect, useState } from "react";
import api from "../api";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);

  const fetchAll = async () => {
    const [a, d] = await Promise.all([
      api.get("/api/alerts"),
      api.get("/api/diagnostics"),
    ]);
    setAlerts(a.data || []);
    setDiagnostics((d.data || []).reverse()); // oldest first for chart
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="row">
      <div className="card grow">
        <h2>Summary</h2>
        <div className="row">
          <Stat label="Total Alerts" value={alerts.length} />
          <Stat
            label="Unresolved"
            value={alerts.filter((a) => !a.resolved).length}
          />
          <Stat
            label="Last Alert"
            value={
              alerts[0]
                ? dayjs(alerts[0].timestamp).format("MMM D, HH:mm")
                : "—"
            }
          />
        </div>
      </div>

      <div className="card" style={{ width: "100%", marginTop: 16 }}>
        <h2>Diagnostics (last 50)</h2>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart
              data={diagnostics.map((d) => ({
                ...d,
                t: dayjs(d.timestamp).format("HH:mm"),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu_usage"
                name="CPU"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="memory_usage"
                name="Memory"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="disk_usage"
                name="Disk"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ flex: "1 1 200px" }}>
      <div style={{ color: "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
