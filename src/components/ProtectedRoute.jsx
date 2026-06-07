import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingState from './LoadingState.jsx';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState text="Verificando sesión..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}

export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState text="Verificando permisos..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
