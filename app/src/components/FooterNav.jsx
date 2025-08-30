import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import GamepadIcon from "./icons/GamepadIcon";
import { useAuth } from "../hooks/useAuth";

export default function FooterNav() {
  const { user } = useAuth();
  const isTutor = user?.rol === "tutor";

  const studentItems = [
    { to: "/dashboard", icon: HomeIcon, label: "Perfil" },
    { to: "/roadmap", icon: MapIcon, label: "RoadMap" },
    { to: "/minigames", icon: GamepadIcon, label: "Juegos" },
  ];

  const tutorItems = [
    { to: "/tutor/dashboard", icon: HomeIcon, label: "Perfil" },
    { to: "/tutor/classes", icon: BuildingLibraryIcon, label: "Clases" },
  ];

  const items = isTutor ? tutorItems : studentItems;

  return (
    <footer className="bg-white border-t border-neutral-200 shadow-soft flex-shrink-0">
      <nav className="flex justify-around py-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-2 rounded-lg transition-colors duration-200 min-w-0 ${
                isActive
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700"
              }`
            }
          >
            <Icon className="w-6 h-6 mb-1 flex-shrink-0" />
            <span className="text-xs font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
