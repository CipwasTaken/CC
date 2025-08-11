import "./index.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Diagnostics from "./pages/Diagnostics";

export default function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <h1>Server Monitor Dashboard</h1>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          <NavLink to="/diagnostics">Diagnostics</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
