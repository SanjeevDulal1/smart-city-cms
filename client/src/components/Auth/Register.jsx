import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const Register = () => {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp]           = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

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
      toast.success('Email verified! You can now log in.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="card p-10 max-w-md w-full text-center shadow-xl border-0 animate-slide-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account verified!</h2>
        <p className="text-gray-500 mb-8">Your account is ready. Start reporting issues in your city.</p>
        <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
          Go to login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 ? 'Create account' : 'Verify email'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Join Smart City CMS' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300
              ${step >= s ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="card p-8 shadow-xl border-0">
          {step === 1 ? (
            <form onSubmit={register} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="name" value={form.name} onChange={handle}
                    className="input-field pl-10" placeholder="Sanjeet Sharma" autoComplete="off" required />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="email" type="email" value={form.email} onChange={handle}
                    className="input-field pl-10" placeholder="you@example.com" autoComplete="off" required />
                </div>
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="phone" value={form.phone} onChange={handle}
                    className="input-field pl-10" placeholder="+977 98XXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    className="input-field pl-10 pr-10" placeholder="Min. 8 characters" autoComplete="off" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-5">
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                Check your inbox at <strong>{form.email}</strong> for a 6-digit code.
              </div>
              <div>
                <label className="label">6-digit OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="input-field text-center text-2xl font-bold tracking-widest"
                  placeholder="000000" maxLength={6} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Verifying...' : 'Verify email'}
              </button>
              <button type="button" onClick={() => setStep(1)}
                className="btn-secondary w-full py-2.5 text-sm">
                Back
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;