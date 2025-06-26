import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import RoadmapPage from './pages/RoadmapPage';
import LevelPage from './pages/LevelPage';
import LevelCompletePage from './pages/LevelCompletePage';
//import MinigamesPage from './pages/MinigamesPage';
//import TutorDashboard from './pages/TutorDashboard';
//import ClassesPage from './pages/ClassesPage';
//import ClassDetailPage from './pages/ClassDetailPage';
import MobileLayout     from './layouts/MobileLayout';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

      {/* Rutas privadas */}
      {user && (
        <>
          {/* Rutas de estudiante */}
          {user.rol === 'estudiante' && (
            <Route element={<MobileLayout />}>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/levels/:nivelId" element={<LevelPage />} />
              <Route path="/levels/:nivelId/completed" element={<LevelCompletePage />} />
              {/*
              <Route path="/minigames" element={<MinigamesPage />} />
              */}
            </Route>
          )}

          {/* Rutas de tutor */}
          {user.rol === 'tutor' && (
            <>
              {/*
              <Route path="/tutor/dashboard" element={<TutorDashboard />} />
              <Route path="/tutor/classes" element={<ClassesPage />} />
              <Route path="/tutor/classes/:id" element={<ClassDetailPage />} />
              */}
            </>
          )}
        </>
      )}

      {/* Fallback: si no coincide */}
      <Route path="*" element={
          user
            ? <Navigate to={user.rol === 'tutor' ? '/tutor/dashboard' : '/'} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;