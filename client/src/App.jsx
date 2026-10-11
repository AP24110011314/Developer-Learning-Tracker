import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Problems from './pages/Problems.jsx';
import Goals from './pages/Goals.jsx';
import Projects from './pages/Projects.jsx';
import Settings from './pages/Settings.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import NotFound from './pages/NotFound.jsx';

function AuthenticatedApp({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? (
    <AuthenticatedApp>
      <Dashboard />
    </AuthenticatedApp>
  ) : (
    <Landing />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={<HomeRoute />} />
            <Route
              path="/problems"
              element={
                <AuthenticatedApp>
                  <Problems />
                </AuthenticatedApp>
              }
            />
            <Route
              path="/goals"
              element={
                <AuthenticatedApp>
                  <Goals />
                </AuthenticatedApp>
              }
            />
            <Route
              path="/projects"
              element={
                <AuthenticatedApp>
                  <Projects />
                </AuthenticatedApp>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthenticatedApp>
                  <Settings />
                </AuthenticatedApp>
              }
            />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
