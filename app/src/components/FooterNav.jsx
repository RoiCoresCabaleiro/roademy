// src/components/FooterNav.jsx

import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

export default function FooterNav() {
  const { user } = useAuth();
  const isTutor = user?.rol === "tutor";

  // Define icon + ruta/label para cada rol
  const studentItems = [
    { to: "/dashboard", icon: HomeIcon, label: "Perfil" },
    { to: "/roadmap", icon: MapPinIcon, label: "RoadMap" },
    { to: "/minigames", icon: QuestionMarkCircleIcon, label: "Juegos" },
  ];

  const tutorItems = [
    { to: "/tutor/dashboard", icon: HomeIcon, label: "Perfil" },
    { to: "/tutor/classes", icon: BuildingLibraryIcon, label: "Clases" },
  ];

  const items = isTutor ? tutorItems : studentItems;

  return (
    <nav className="flex justify-around">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className="flex flex-col items-center px-4 py-2"
          style={({ isActive }) => ({
            color: isActive ? "#3b82f6" : undefined,
          })}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
