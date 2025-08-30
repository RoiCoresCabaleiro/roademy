import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  BuildingLibraryIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import GamepadIcon from "./icons/GamepadIcon";
import { useAuth } from "../hooks/useAuth";
import Logo from "./Logo";

export default function HeaderNav() {
  const { user, logout } = useAuth();
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
    <header className="bg-white border-b border-neutral-200 shadow-soft flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="sm" />
            <span className="ml-3 text-xl font-bold text-neutral-900">
              Roademy
            </span>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-8">
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Información de usuario */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-medium text-neutral-900">
                {user?.nombre}
              </span>
              <span className="text-xs text-neutral-500 capitalize">
                {user?.rol}
              </span>
            </div>

            {/* Botón de Cerrar Sesión */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
