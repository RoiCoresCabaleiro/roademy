// src/components/Guards/RoleRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../Spinner";

export function RoleRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Cargando..." />;
  if (!user) return <Navigate to="/login" replace />;
  return user?.rol === role ? <Outlet /> : <Navigate to="/login" replace />;
}
