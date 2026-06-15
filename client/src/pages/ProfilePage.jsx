import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, FileText, ArrowLeft, Save, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import API, { complaintAPI } from '../services/api';

const ProfilePage = () => {
  const { user, setUser }       = useAuthStore();
  const [phone, setPhone]       = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [stats,       setStats]       = useState(null);
  const [activeTab,   setActiveTab]   = useState('profile');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await complaintAPI.getMyComplaints({ limit: 100 });
        const complaints = data.complaints || [];
        setStats({
          total:    data.pagination?.total || complaints.length,
          pending:  complaints.filter((c) => c.status === 'pending').length,
          progress: complaints.filter((c) => ['under_review','in_progress'].includes(c.status)).length,
          resolved: complaints.filter((c) => c.status === 'resolved').length,
          rejected: complaints.filter((c) => c.status === 'rejected').length,
        });
      } catch {
        // silent
      }
    };
    loadStats();
  }, []);

  const savePhone = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', { phone });
      if (data.success) {
        setUser(data.user);
        toast.success('Phone number updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword) return toast.error('Please enter your current password');
    if (!newPassword)     return toast.error('Please enter a new password');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', {
        phone,
        currentPassword,
        newPassword,
      });
      if (data.success) {
        setUser(data.user);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const pwStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8)          s++;
    if (/[A-Z]/.test(pass))        s++;
    if (/[0-9]/.test(pass))        s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength      = pwStrength(newPassword);
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  return (
    <div className="min-h-screen pt-20 pb-12"
      style={{ background: 'linear-gradient(180deg, #f0f1ff 0%, #f9fafb 20%)' }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <Link to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Profile header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-extrabold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white truncate">{user?.name}</h1>
              <p className="text-white/70 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <User className="w-3 h-3" /> Citizen
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <FileText className="w-3 h-3" />
                  {stats?.total ?? '...'} reports
                </span>
              </div>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/20">
              {[
                { label: 'Total',    value: stats.total    },
                { label: 'Pending',  value: stats.pending  },
                { label: 'Active',   value: stats.progress },
                { label: 'Resolved', value: stats.resolved },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-white/60 text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-gray-100">
          <button type="button" onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}>
            <User className="w-4 h-4" /> Profile
          </button>
          <button type="button" onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}>
            <Shield className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5 animate-fade-in">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Personal information</h2>
              <p className="text-sm text-gray-500">
                Your name and email are locked for security. You can update your phone number.
              </p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                Full name
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  🔒 Locked
                </span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  value={user?.name || ''}
                  className="input-field pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Name cannot be changed to prevent identity misuse</p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                Email address
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-normal flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  value={user?.email || ''}
                  className="input-field pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email is verified and cannot be changed</p>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                Phone number
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-normal">
                  ✏️ Editable
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder="+977 98XXXXXXXX"
                  autoComplete="off"
                />
              </div>
            </div>

            <button type="button" onClick={savePhone} disabled={saving}
              className="btn-primary w-full py-3 font-semibold">
              {saving
                ? <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                : <><Save className="w-4 h-4" /> Save changes</>}
            </button>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5 animate-fade-in">
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Change password</h2>
              <p className="text-sm text-gray-500">Use a strong password with uppercase, numbers and symbols.</p>
            </div>

            <div>
              <label className="label">Current password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter current password"
                  autoComplete="off"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-300
                          ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold
                    ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500'
                      : strength === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}

              <div className="mt-2 space-y-1">
                {[
                  { rule: /.{8,}/, label: 'At least 8 characters' },
                  { rule: /[A-Z]/, label: 'One uppercase letter'  },
                  { rule: /[0-9]/, label: 'One number'            },
                ].map(({ rule, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors
                      ${newPassword && rule.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <p className={`text-xs transition-colors
                      ${newPassword && rule.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-field pl-10 pr-10
                    ${confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:ring-red-400'
                      : confirmPassword && newPassword === confirmPassword
                      ? 'border-green-300 focus:ring-green-400' : ''}`}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={savePassword}
              disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="btn-primary w-full py-3 font-semibold disabled:opacity-50">
              {saving
                ? <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                : <><Shield className="w-4 h-4" /> Update password</>}
            </button>

            <div className="text-center pt-2">
              <Link to="/forgot-password"
                className="text-sm text-indigo-600 hover:underline font-medium">
                Forgot your current password?
              </Link>
            </div>
          </div>
        )}

        {/* Quick link */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your complaints</p>
              <p className="text-xs text-gray-500">{stats?.total ?? '...'} total reports submitted</p>
            </div>
          </div>
          <Link to="/dashboard"
            className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;