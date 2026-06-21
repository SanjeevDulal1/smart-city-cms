import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, MapPin, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin]   = useState(false);
  const [error, setError]       = useState('');
  const { loginUser, loginAdmin, loading } = useAuthStore();
  const navigate = useNavigate();

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // clear error on typing
  };

  const submit = async (e) => {
  e.preventDefault();
  setError('');
  const fn = isAdmin ? loginAdmin : loginUser;
  try {
    const res = await fn(form);
    if (res.success) {
      toast.success('Welcome back!');
      navigate(isAdmin ? '/admin' : '/');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  } catch (err) {
    // Safety net — catches any unexpected throw
    setError('Something went wrong. Please try again.');
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl mb-5 border border-white/30">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white">Welcome back</h1>
          <p className="text-white/60 mt-2 text-base">Sign in to Smart City CMS</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-white/20">
          <button onClick={() => { setIsAdmin(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${!isAdmin ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/70 hover:text-white'}`}>
            <MapPin className="w-4 h-4" /> Citizen
          </button>
          <button onClick={() => { setIsAdmin(true); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${isAdmin ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/70 hover:text-white'}`}>
            <Shield className="w-4 h-4" /> Admin
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl mb-5 animate-fade-in">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5" autoComplete="off">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handle}
                  className={`input-field pl-10 ${error ? 'border-red-300' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  className={`input-field pl-10 pr-10 ${error ? 'border-red-300' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isAdmin && (
              <div className="text-right">
                <Link to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-semibold mt-2">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : `Sign in as ${isAdmin ? 'Admin' : 'Citizen'}`}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Smart City CMS · Kathmandu Metropolitan City
        </p>
      </div>
    </div>
  );
};

export default Login;