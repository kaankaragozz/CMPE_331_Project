import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between px-6 bg-white shadow">
          <h1 className="text-lg font-semibold">Flight Roster Management</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Hello, Roster Manager</span>
            <button className="text-sm text-red-500 hover:underline">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
