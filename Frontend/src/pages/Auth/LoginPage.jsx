import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    const value =
      field === "remember" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Dummy validation – replace with real API call later
    if (!form.username || !form.password) {
      setError("Invalid username or password. Please try again.");
      return;
    }

    setError("");
    console.log("Logging in with:", form);
    // TODO: call backend & redirect on success
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* Logo placeholder */}
        <div className="w-16 h-10 mx-auto mb-4 border border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400">
          Logo
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-slate-900 mb-6 text-center">
          Flight Roster Management System
        </h1>

        {/* Form */}
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

          {error && (
            <p className="text-xs text-red-500">
              {error}
            </p>
          )}

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
            <button
              type="button"
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
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
