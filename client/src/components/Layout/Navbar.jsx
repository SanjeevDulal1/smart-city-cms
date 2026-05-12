import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin, User, LogOut, Menu, X,
  Shield, LayoutDashboard, FileText, Home,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, admin, logout, isUser, isAdmin } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = isAdmin()
    ? [{ to: '/admin',     icon: LayoutDashboard, label: 'Dashboard' }]
    : isUser()
    ? [
        { to: '/',          icon: Home,        label: 'Map'       },
        { to: '/report',    icon: FileText,    label: 'Report'    },
        { to: '/dashboard', icon: LayoutDashboard, label: 'My Reports' },
      ]
    : [
        { to: '/',      icon: Home,   label: 'Map'      },
        { to: '/login', icon: User,   label: 'Sign in'  },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 text-sm leading-tight">Smart City</p>
              <p className="text-xs text-gray-500 leading-tight">Complaint System</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {(isUser() || isAdmin()) ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    {isAdmin()
                      ? <Shield className="w-3.5 h-3.5 text-primary-600" />
                      : <User className="w-3.5 h-3.5 text-primary-600" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {(user || admin)?.name?.split(' ')[0]}
                  </span>
                </div>
                <button onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"  className="btn-secondary text-sm py-2">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-fade-in">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all
                  ${isActive(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;