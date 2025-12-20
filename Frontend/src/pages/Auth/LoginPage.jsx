import { useState } from "react";
import logo from "../../assets/logo.jpeg";

const API_BASE = "http://localhost:3000";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    const value = field === "remember" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);
      console.log("Cabin Crew ID:", data.user?.cabincrewId);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const user = data.user;

      localStorage.setItem("token", String(user.id));
      localStorage.setItem("userId", String(user.id));
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);

      if (user.pilot_id) localStorage.setItem("pilotId", String(user.pilot_id));
      else localStorage.removeItem("pilotId");

      if (user.cabin_crew_id)
        localStorage.setItem("cabincrewId", String(user.cabin_crew_id));
      else localStorage.removeItem("cabincrewId");

      if (user.passenger_id)
        localStorage.setItem("passengerId", String(user.passenger_id));
      else localStorage.removeItem("passengerId");

      // Role-based redirect
      if (user.role === "Admin") window.location.href = "/";
      else if (user.role === "Pilot") window.location.href = "/pilot";
      else if (user.role === "CabinCrew") window.location.href = "/cabincrew";
      else if (user.role === "Passenger") window.location.href = "/passenger";
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* ✅ Logo (reasonable size) */}
        <div className="flex justify-center mb-3">
          <div className="h-14 w-14 rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="Company Logo"
              className="h-10 w-10 object-contain"
              draggable={false}
            />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-slate-900 mb-6 text-center">
          Flight Roster Management System
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Username/Email
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.username}
              onChange={handleChange("username")}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.password}
              onChange={handleChange("password")}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-3.5 w-3.5"
                checked={form.remember}
                onChange={handleChange("remember")}
              />
              <span className="text-slate-700">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-3 w-full rounded-md bg-blue-500 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
