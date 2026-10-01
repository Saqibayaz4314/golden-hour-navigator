import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WifiOff } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GrokAssistant from './components/GrokAssistant';
import DriverPage from './pages/DriverPage';
import LoginPage from './pages/LoginPage';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalsPage from './pages/HospitalsPage';
import DoctorsPage from './pages/DoctorsPage';
import SystemAnalytics from './pages/SystemAnalytics';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function OfflineBar() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="offline-bar">
      <WifiOff size={14} />
      You're offline — showing last cached data. Some features may be unavailable.
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <OfflineBar />
      <GrokAssistant />
      <Routes>
        <Route path="/"                  element={<DriverPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/hospitals"         element={<HospitalsPage />} />
        <Route path="/doctors"           element={<DoctorsPage />} />
        <Route path="/analytics"         element={<SystemAnalytics />} />
        <Route path="/hospital/dashboard" element={
          <ProtectedRoute><HospitalDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-raised)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              boxShadow: 'var(--shadow)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
