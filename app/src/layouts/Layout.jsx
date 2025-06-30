// src/layouts/Layout.jsx

import { Outlet } from "react-router-dom";
import FooterNav from "../components/FooterNav";
import HeaderNav from "../components/HeaderNav";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header sticky */}
      <header className="hidden md:flex sticky top-0 z-10 bg-white border-b">
        <HeaderNav />
      </header>

      {/* Contenedor scrolleable */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Footer sticky */}
      <footer className="md:hidden sticky bottom-0 z-10 bg-white border-t">
        <FooterNav />
      </footer>
    </div>
  );
}