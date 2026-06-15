import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff,
  CheckCircle, ArrowLeft, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const navigate                      = useNavigate();

  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8)          score++;
    if (/[A-Z]/.test(pass))        score++;
    if (/[a-z]/.test(pass))        score++;
    if (/[0-9]/.test(pass))        score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const map = {
      0: { label: '',           color: ''               },
      1: { label: 'Very weak',  color: 'bg-red-500'     },
      2: { label: 'Weak',       color: 'bg-orange-500'  },
      3: { label: 'Fair',       color: 'bg-yellow-500'  },
      4: { label: 'Good',       color: 'bg-blue-500'    },
      5: { label: 'Strong',     color: 'bg-green-500'   },
    };
    return { strength: score, ...map[score] };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const sendOTP = async (e) => {
    e?.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent! Check your email inbox.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6)        return toast.error('Please enter the 6-digit OTP');
    if (newPassword.length < 8)  return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (pwStrength.strength < 3) return toast.error('Please choose a stronger password');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setStep(3);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Check your OTP.');
    } finally {
      setLoading(false);
    }
  };

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
            {step === 1 && 'Forgot password?'}
            {step === 2 && 'Reset password'}
            {step === 3 && 'All done!'}
          </h1>
          <p className="text-white/60 mt-2">
            {step === 1 && "Enter your email and we'll send you a reset code"}
            {step === 2 && `Enter the OTP sent to ${email}`}
            {step === 3 && 'Your password has been reset successfully'}
          </p>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="flex gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500
                  ${step >= s ? 'bg-white' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in">
            <form onSubmit={sendOTP} className="space-y-5" autoComplete="off">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    autoComplete="off"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-semibold">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : 'Send reset code'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        )}

        {/* ── Step 2: OTP + New Password ── */}
        {step === 2 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in">

            {/* Email info */}
            <div className="bg-indigo-50 rounded-2xl p-3.5 flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-indigo-600 font-semibold">OTP sent to</p>
                <p className="text-sm font-bold text-indigo-800 truncate">{email}</p>
              </div>
              <button onClick={() => setStep(1)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline">
                Change
              </button>
            </div>

            <form onSubmit={resetPassword} className="space-y-5" autoComplete="off">
              {/* OTP */}
              <div>
                <label className="label">6-digit OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-3xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="off"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              {/* New password */}
              <div>
                <label className="label">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i}
                          className={`flex-1 h-1.5 rounded-full transition-all duration-300
                            ${i <= pwStrength.strength ? pwStrength.color : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    {pwStrength.label && (
                      <p className={`text-xs font-semibold
                        ${pwStrength.strength <= 2 ? 'text-red-500'
                          : pwStrength.strength === 3 ? 'text-yellow-600'
                          : 'text-green-600'}`}>
                        {pwStrength.label}
                      </p>
                    )}
                  </div>
                )}

                {/* Rules */}
                <div className="mt-2 space-y-1">
                  {[
                    { rule: /.{8,}/, label: 'At least 8 characters' },
                    { rule: /[A-Z]/, label: 'One uppercase letter'  },
                    { rule: /[0-9]/, label: 'One number'            },
                  ].map(({ rule, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors
                        ${rule.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <p className={`text-xs transition-colors
                        ${rule.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="label">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`input-field pl-10 pr-10 transition-all
                      ${confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-300 focus:ring-red-400'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-green-300 focus:ring-green-400'
                        : ''}`}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              <button type="submit"
                disabled={loading || newPassword !== confirmPassword || !otp}
                className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </span>
                ) : 'Reset password'}
              </button>

              <button type="button" onClick={sendOTP} disabled={loading}
                className="text-sm text-indigo-600 hover:underline w-full text-center font-medium">
                Didn't receive the code? Resend OTP
              </button>
            </form>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full py-3.5 text-base font-semibold">
              Go to login
            </button>
          </div>
        )}

        <p className="text-center text-white/40 text-xs mt-6">
          Smart City CMS · Kathmandu Metropolitan City
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;