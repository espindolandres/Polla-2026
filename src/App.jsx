import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Admin from './pages/Admin.jsx';
import AdminImport from './pages/AdminImport.jsx';
import AdminMatches from './pages/AdminMatches.jsx';
import AdminResults from './pages/AdminResults.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Login from './pages/Login.jsx';
import Matches from './pages/Matches.jsx';
import Predictions from './pages/Predictions.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import Rules from './pages/Rules.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/matches" element={<AdminRoute><AdminMatches /></AdminRoute>} />
            <Route path="/admin/results" element={<AdminRoute><AdminResults /></AdminRoute>} />
            <Route path="/admin/import" element={<AdminRoute><AdminImport /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
