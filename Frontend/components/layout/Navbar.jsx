// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      {/* Left side: Logo + Title + Main nav */}
      <div className="flex items-center gap-6">
        {/* Logo + title (clickable -> dashboard) */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 focus:outline-none"
        >
          {/* Circular logo */}
          <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            FR
          </div>
          <div className="hidden sm:block text-left">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900">
              Flight Roster Management
            </h1>
            <p className="text-xs text-slate-500">
              Airline operations console
            </p>
          </div>
        </button>

        {/* Primary navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/flights"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Flights
          </NavLink>

          {/* If you have these routes later, just uncomment or add more */}
          {/*
          <NavLink
            to="/passengers"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Passengers
          </NavLink>

          <NavLink
            to="/crew"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Crew
          </NavLink>
          */}
        </nav>
      </div>

      {/* Right side: actions + user */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900">
              Roster Manager
            </p>
            <p className="text-[11px] text-slate-500">
              admin@airline.com
            </p>
          </div>
          {/* User avatar */}
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            RM
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            window.location.reload();
          }}
          className="text-xs text-slate-500 hover:text-red-500"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
