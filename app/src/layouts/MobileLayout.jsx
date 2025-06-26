// src/layouts/MobileLayout.jsx

import { Outlet } from "react-router-dom";
import FooterNav from "../components/FooterNav";

export default function MobileLayout() {
  return (
    <div
      className="w-full max-w-[390px] h-screen mx-auto overflow-auto bg-gray-50"
      style={{ aspectRatio: "390 / 844" }}
    >
      <Outlet />      {/* Aquí se renderiza la página activa */}
      <FooterNav />
    </div>
  );
}
