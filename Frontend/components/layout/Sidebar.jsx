import { NavLink } from "react-router-dom";

const linkClass =
  "block px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white";
const activeClass = "bg-slate-800 text-white";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col gap-4 p-4">
      <div className="font-bold text-xl mb-4">FRMS</div>
      <nav className="flex-1 flex flex-col gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : "text-slate-200"}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/flights"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : "text-slate-200"}`
          }
        >
          Flights
        </NavLink>
        <NavLink
          to="/settings/database"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : "text-slate-200"}`
          }
        >
          Database Settings
        </NavLink>
      </nav>
      <p className="text-xs text-slate-400 mt-auto">v0.1 • Student Project</p>
    </aside>
  );
}
