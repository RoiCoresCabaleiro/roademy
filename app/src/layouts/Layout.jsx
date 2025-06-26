// src/layouts/Layout.jsx

import { Outlet } from "react-router-dom";
import FooterNav from "../components/FooterNav";
import HeaderNav from "../components/HeaderNav";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header en pantallas md+ */}
      <header className="hidden md:flex w-full bg-white shadow p-4">
        <HeaderNav />
      </header>

      <main className="flex-1 overflow-auto p-4 bg-gray-50">
        <Outlet />
      </main>

      {/* Footer en pantallas <md */}
      <footer className="fixed bottom-0 w-full md:hidden bg-white border-t">
        <FooterNav />
      </footer>
    </div>
  );
}