import Navbar from "./Navbar.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* If you have a Sidebar, keep it here */}
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
