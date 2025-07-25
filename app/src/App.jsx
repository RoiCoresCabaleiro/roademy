// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./layouts/Layout";
import { RoleRoute } from "./components/guards/RoleRoute";

// Páginas
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const LevelPage = lazy(() => import("./pages/LevelPage"));
const LevelCompletePage = lazy(() => import("./pages/LevelCompletePage"));
const MinigamesPage = lazy(() => import("./pages/MinigamesPage"));
const MinigamePage = lazy(() => import("./pages/MinigamePage"));

const TutorDashboard = lazy(() => import("./pages/TutorDashboard"));
const ClassesPage = lazy(() => import("./pages/ClassesPage"));
const ClassDetailPage = lazy(() => import("./pages/ClassDetailPage"));
/*
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import StudentDashboard from './pages/StudentDashboard';
import RoadmapPage from './pages/RoadmapPage';
import LevelPage from './pages/LevelPage';
import LevelCompletePage from './pages/LevelCompletePage';
import MinigamesPage from './pages/MinigamesPage';
import MinigamePage from './pages/MinigamePage';

import TutorDashboard from './pages/TutorDashboard';
import ClassesPage from './pages/ClassesPage';
import ClassDetailPage from './pages/ClassDetailPage';
*/

export default function App() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Todas las rutas con header/footer */}
        <Route element={<Layout />}>
          {/* Rutas Estudiante */}
          <Route element={<RoleRoute role="estudiante" />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="levels/:nivelId" element={<LevelPage />} />
            <Route
              path="levels/:nivelId/completed"
              element={<LevelCompletePage />}
            />
            <Route path="minigames" element={<MinigamesPage />} />
            <Route path="minigames/:minijuegoId" element={<MinigamePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Rutas de tutor */}
          <Route element={<RoleRoute role="tutor" />}>
            <Route index element={<Navigate to="/tutor/dashboard" replace />} />
            <Route path="tutor/dashboard" element={<TutorDashboard />} />
            <Route path="tutor/classes" element={<ClassesPage />} />
            <Route path="tutor/classes/:id" element={<ClassDetailPage />} />
            <Route
              path="*"
              element={<Navigate to="/tutor/dashboard" replace />}
            />
          </Route>
        </Route>

        {/* Fallback global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
