// src/components/HeaderNav.jsx

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function HeaderNav() {
  const { user, logout } = useAuth();
  const isTutor = user?.rol === "tutor";

  const studentItems = [
    { to: "/dashboard", label: "Perfil" },
    { to: "/roadmap", label: "RoadMap" },
    { to: "/minigames", label: "Juegos" },
  ];

  const tutorItems = [
    { to: "/tutor/dashboard", label: "Perfil" },
    { to: "/tutor/classes", label: "Clases" },
  ];

  const items = isTutor ? tutorItems : studentItems;

  return (
    <nav className="flex items-center px-6">
      <div className="flex space-x-4">
        {items.map(({ to, label }) => (
        <NavLink key={to} to={to} className="px-4 py-4"
          style={({ isActive }) => ({
            fontWeight: isActive ? "bold" : undefined,
            color: isActive ? "#3b82f6" : undefined,
          })}
        >
          {label}
        </NavLink>
      ))}
      </div>
      <div className="absolute right-8">
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="flex items-center space-x-1 px-4 py-2 ml-8 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5"/>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
