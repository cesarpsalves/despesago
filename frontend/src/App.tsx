import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import SuperAdmin from './pages/SuperAdmin';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import Subscription from './pages/Admin/Subscription';
import SetPassword from './pages/SetPassword';
import Profile from './pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, requireOnboarding } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-gray-500 font-medium animate-pulse">Carregando DespesaGo...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (requireOnboarding) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route 
            path="/app" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/app/subscription" 
            element={
              <PrivateRoute>
                <Subscription />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/superadmin" 
            element={
              <PrivateRoute>
                <SuperAdmin />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/set-password" 
            element={
              <PrivateRoute>
                <SetPassword />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/app/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
