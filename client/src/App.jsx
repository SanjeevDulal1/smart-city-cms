import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import OfflineBanner from './components/UI/OfflineBanner';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import useAuthStore from './store/authStore';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const ProtectedUser = ({ children }) => {
  const { user, token } = useAuthStore();
  return (user && token) ? children : <Navigate to="/login" replace />;
};

const ProtectedAdmin = ({ children }) => {
  const { admin, token } = useAuthStore();
  return (admin && token) ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        }}
      />
      <Navbar />
      <OfflineBanner />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/complaint/:id" element={<ComplaintDetailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/report"
          element={
            <ProtectedUser>
              <ReportPage />
            </ProtectedUser>
          }
        />
        <Route path="/dashboard"
          element={
            <ProtectedUser>
              <DashboardPage />
            </ProtectedUser>
          }
        />
        <Route path="/admin"
          element={
            <ProtectedAdmin>
              <AdminPage />
            </ProtectedAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;