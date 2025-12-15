// src/components/layout/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "Admin";
  const email = localStorage.getItem("userEmail") || "user@airline.com";

  const roleSubtitleMap = {
    Admin: "Administrator console",
    Pilot: "Pilot console",
    CabinCrew: "Cabin crew console",
    Passenger: "Passenger portal",
  };

  const subtitle = roleSubtitleMap[role] || "User console";

  // Role-based nav items
  const navItems = [
    { to: "/", label: "Dashboard", roles: ["Admin"] },
    { to: "/flights", label: "Flights", roles: ["Admin", "CabinCrew"] },
    { to: "/pilot", label: "Seat Map", roles: ["Pilot"] },
    { to: "/passenger", label: "My Seat", roles: ["Passenger"] },
    {
      to: "/user/profile",
      label: "Profile",
      roles: ["Admin", "Pilot", "CabinCrew", "Passenger"],
    },
  ].filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  const showNewRosterButton = role === "Admin" || role === "CabinCrew";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200">
      {/* Left: Logo + title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-slate-300">
          <span className="text-xs font-semibold tracking-wide text-slate-800">
            FR
          </span>
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900">
            Flight Roster Management
          </h1>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Middle: Navigation links */}
      <nav className="hidden md:flex items-center gap-3 lg:gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "text-xs lg:text-sm px-3 py-1.5 rounded-full transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: quick actions + user */}
      <div className="flex items-center gap-3">
        {showNewRosterButton && (
          <button
            onClick={() => navigate("/flights")}
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 hover:bg-slate-800"
          >
            New roster
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900">
              {role || "User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
              {email}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">
            {role?.[0] || "U"}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

