// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "Admin";
  const name = localStorage.getItem("userName") || "Roster Manager";

  const homePath =
    role === "Pilot"
      ? "/pilot"
      : role === "CabinCrew"
      ? "/cabincrew"
      : role === "Passenger"
      ? "/passenger"
      : "/";

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      {/* Left side: Logo + Title + Main nav */}
      <div className="flex items-center gap-6">
        {/* Logo + title (clickable -> role home) */}
        <button
          type="button"
          onClick={() => navigate(homePath)}
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
              {role === "Pilot"
                ? "Pilot dashboard"
                : role === "CabinCrew"
                ? "Cabin crew console"
                : role === "Passenger"
                ? "Passenger portal"
                : "Operations dashboard"}
            </p>
          </div>
        </button>

        {/* Primary navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavLink
            to={homePath}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Home
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

          <NavLink
            to="/user/profile"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            Profile
          </NavLink>
        </nav>
      </div>

      {/* Right side: user + logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900">
              {name}
            </p>
            <p className="text-[11px] text-slate-500">{role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            window.location.href = "/login";
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
