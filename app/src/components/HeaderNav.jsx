// src/components/HeaderNav.jsx

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function HeaderNav() {
  const { user } = useAuth();
  const isTutor = user?.rol === "tutor";

  const studentItems = [
    { to: "/dashboard", label: "Perfil" },
    { to: "/roadmap", label: "RoadMap" },
    { to: "/minigames", label: "Juegos" },
  ];

  const tutorItems = [
    { to: "/tutor/classes", label: "Clases" },
    { to: "/tutor/dashboard", label: "Dashboard" },
  ];

  const items = [...(isTutor ? tutorItems : studentItems)];

  return (
    <nav className="flex space-x-6">
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className="hover:underline"
          style={({ isActive }) => ({
            fontWeight: isActive ? "bold" : undefined,
            color: isActive ? "#3b82f6" : undefined,
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
