import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin, LogOut, Menu, X, Shield,
  LayoutDashboard, FileText, Home,
  User, ChevronDown, ClipboardList,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, admin, logout, isUser, isAdmin } = useAuthStore();
  const location   = useLocation();
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = isAdmin()
    ? [{ to: '/admin', icon: LayoutDashboard, label: 'Dashboard' }]
    : isUser()
    ? [
        { to: '/',          icon: Home,            label: 'Map'        },
        { to: '/report',    icon: FileText,        label: 'Report'     },
        { to: '/dashboard', icon: LayoutDashboard, label: 'My Reports' },
      ]
    : [{ to: '/', icon: Home, label: 'Map' }];

  const currentUser = user || admin;
  const initials = currentUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 text-sm leading-tight">Smart City</p>
                <p className="text-xs text-gray-500 leading-tight">Complaint System</p>
              </div>
              <p className="font-bold text-gray-900 text-sm sm:hidden">SmartCity</p>
            </Link>

            {/* Desktop Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive(to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {(isUser() || isAdmin()) ? (
                <>
                  {/* Desktop profile dropdown */}
                  <div className="relative hidden md:block" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200
                        ${profileOpen
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{initials}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 max-w-24 truncate">
                        {currentUser?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200
                        ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">

                        {/* Header */}
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg font-bold">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{currentUser?.name}</p>
                              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                              {isAdmin() && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                                  <Shield className="w-3 h-3" />
                                  {admin?.role === 'super_admin' ? 'Super Admin' : 'Ward Admin'}
                                </span>
                              )}
                              {isUser() && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                  <User className="w-3 h-3" />
                                  Citizen · {user?.totalComplaints || 0} reports
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-2">
                          {isUser() && (
                            <>
                              <Link to="/profile"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium">
                                <User className="w-4 h-4" />
                                My profile
                              </Link>
                              <Link to="/dashboard"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium">
                                <ClipboardList className="w-4 h-4" />
                                My complaints
                              </Link>
                              <Link to="/report"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium">
                                <FileText className="w-4 h-4" />
                                Report new issue
                              </Link>
                            </>
                          )}
                          {isAdmin() && (
                            <Link to="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium">
                              <LayoutDashboard className="w-4 h-4" />
                              Admin panel
                            </Link>
                          )}
                        </div>

                        {/* Sign out */}
                        <div className="p-2 border-t border-gray-100">
                          <button onClick={() => { logout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all font-medium">
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  {location.pathname !== '/login' && (
                    <Link to="/login" className="btn-secondary text-sm py-2">Sign in</Link>
                  )}
                  {location.pathname !== '/register' && (
                    <Link to="/register" className="btn-primary text-sm py-2">Sign up</Link>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden animate-fade-in"
          style={{ paddingTop: '3.5rem' }}>
          <div className="flex flex-col h-full px-4 py-6">

            {/* User info */}
            {(isUser() || isAdmin()) && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6 border border-indigo-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="space-y-1 flex-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all
                    ${isActive(to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                    ${isActive(to) ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {label}
                </Link>
              ))}

              {/* Mobile extra links */}
              {isUser() && (
                <>
                  <Link to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    My profile
                  </Link>
                  <Link to="/report"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    Report new issue
                  </Link>
                </>
              )}
            </div>

            {/* Bottom actions */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {(isUser() || isAdmin()) ? (
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-600 hover:bg-red-50 font-semibold transition-all">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  Sign out
                </button>
              ) : (
                <>
                  <Link to="/login"
                    className="flex items-center justify-center w-full py-4 rounded-2xl border border-gray-200 text-gray-700 font-semibold">
                    Sign in
                  </Link>
                  <Link to="/register"
                    className="flex items-center justify-center w-full py-4 rounded-2xl bg-indigo-600 text-white font-semibold">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;