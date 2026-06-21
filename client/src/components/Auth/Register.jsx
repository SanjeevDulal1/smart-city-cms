import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Phone,
  Eye, EyeOff, MapPin, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Register = () => {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp]           = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const register = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email: form.email, otp });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-white/20 animate-slide-up relative z-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          You're in! 🎉
        </h2>
        <p className="text-gray-500 mb-2">
          Welcome to Smart City CMS, <strong>{form.name.split(' ')[0]}</strong>!
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Your account is verified and ready. Start reporting issues in Kathmandu.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full py-3.5 text-base font-semibold">
          Go to login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl mb-5 border border-white/30">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white">
            {step === 1 ? 'Create account' : 'Verify email'}
          </h1>
          <p className="text-white/60 mt-2">
            {step === 1
              ? 'Join Smart City CMS for free'
              : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500
                ${step >= s ? 'bg-white' : 'bg-white/20'}`}
            />
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">

          {step === 1 ? (
            <form onSubmit={register} className="space-y-4" autoComplete="off">
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handle}
                    className="input-field pl-10"
                    placeholder="Sanjeev Dulal"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handle}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Phone
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handle}
                    className="input-field pl-10"
                    placeholder="+977 98XXXXXXXX"
                    autoComplete="off"
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
                    className="input-field pl-10 pr-10"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength dots */}
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300
                          ${form.password.length >= i * 2
                            ? form.password.length >= 8 ? 'bg-green-400' : 'bg-amber-400'
                            : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-semibold mt-2">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-5" autoComplete="off">
              <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Check your inbox</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    We sent a 6-digit code to <strong>{form.email}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="label">6-digit OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  className="input-field text-center text-3xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="off"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : 'Verify email'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary w-full py-2.5 text-sm">
                ← Back
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
                  Sign in
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

export default Register;