// src/components/Guards/RoleRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RoleRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user?.rol === role
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
