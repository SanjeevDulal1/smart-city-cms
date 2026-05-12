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
import useAuthStore from './store/authStore';

const ProtectedUser = ({ children }) => {
  const { isUser } = useAuthStore();
  return isUser() ? children : <Navigate to="/login" replace />;
};

const ProtectedAdmin = ({ children }) => {
  const { isAdmin } = useAuthStore();
  return isAdmin() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
      }} />
      <Navbar />
      <OfflineBanner />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/report"    element={<ProtectedUser><ReportPage /></ProtectedUser>} />
        <Route path="/dashboard" element={<ProtectedUser><DashboardPage /></ProtectedUser>} />
        <Route path="/admin"     element={<ProtectedAdmin><AdminPage /></ProtectedAdmin>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;