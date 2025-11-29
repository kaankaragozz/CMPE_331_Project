// src/pages/Users/UserProfilePage.jsx
import { useState } from "react";

export default function UserProfilePage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    role: "Roster Manager",
    email: "john.doe@example.com",
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark"); // light | dark

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = () => {
    console.log("Saving profile:", profile);
    alert("Profile saved (check console for payload).");
  };

  const handleChangePassword = () => {
    alert("Change password flow would open here.");
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled((prev) => !prev);
  };

  const handleThemeChange = (value) => {
    setTheme(value);
    // later: hook into global theme context
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-slate-900">
        User Profile / Settings
      </h2>

      {/* Profile info */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={profile.name}
              onChange={handleChange("name")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Role
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={profile.role}
              onChange={handleChange("role")}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={profile.email}
            onChange={handleChange("email")}
          />
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          className="mt-2 inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Save Profile
        </button>
      </section>

      {/* Security */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Security
        </h3>

        <div className="flex flex-col gap-6">
          {/* Change password row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Change Password
              </p>
              <p className="text-xs text-slate-500">
                Update your account password regularly for better security.
              </p>
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Change Password
            </button>
          </div>

          {/* 2FA row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-slate-500">
                Add an extra layer of security to your account.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTwoFactor}
              className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
                twoFactorEnabled
                  ? "bg-green-500 border-green-500"
                  : "bg-slate-300 border-slate-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  twoFactorEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Preferences
        </h3>

        <div className="space-y-4">
          {/* Language */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-800">Language</p>
            <div className="relative w-full sm:w-44">
              <select
                className="w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="jp">日本語</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-800">Theme</p>
            <div className="inline-flex rounded-md border border-slate-300 overflow-hidden">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`px-4 py-2 text-sm font-medium ${
                  theme === "light"
                    ? "bg-slate-200 text-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`px-4 py-2 text-sm font-medium ${
                  theme === "dark"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
