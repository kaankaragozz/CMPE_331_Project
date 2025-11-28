export default function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      {/* Left side: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
          FR
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900">
            Flight Roster Management
          </h1>
          <p className="text-xs text-slate-500">
            Dashboard overview
          </p>
        </div>
      </div>

      {/* Middle: Search (optional) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search flights, crew, passengers..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:bg-white"
          />
          <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right side: User + Actions */}
      <div className="flex items-center gap-4">
        <button className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          <span>New roster</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-900">
              Roster Manager
            </p>
            <p className="text-[11px] text-slate-500">
              admin@airline.com
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">
            RM
          </div>
        </div>

        <button className="text-xs text-slate-500 hover:text-red-500">
          Logout
        </button>
      </div>
    </header>
  );
}
