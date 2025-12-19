// components/layout/AppLayout.jsx
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AppLayout({ children }) {
  const { pathname } = useLocation();

  // Hide navbar on login (and optionally other auth pages)
  const hideNavbar = pathname === "/login";

  return (
    <div className="min-h-screen flex bg-slate-100">
      <div className="flex-1 flex flex-col">
        {!hideNavbar && <Navbar />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
