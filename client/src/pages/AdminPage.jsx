import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, MapPin,
  CheckCircle, Clock, AlertTriangle,
  ChevronDown, Shield, RefreshCw, Edit2,
  Trash2, X, Save, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { adminAPI, wardAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getCategoryInfo, timeAgo, priorityLabel } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️', sewage_overflow:'🚰',
  flood:'🌊', pothole:'🕳️', broken_light:'💡', garbage:'🗑️',
  broken_footpath:'🚶', noise:'🔊', other:'📌',
};

const STATUSES = ['pending','under_review','in_progress','resolved','rejected'];

// ── Edit Admin Modal ──────────────────────────────────────────
const EditAdminModal = ({ admin, wards, onClose, onSave }) => {
  const [form, setForm] = useState({
  name:     admin.name,
  email:    admin.email,
  wardId:   admin.ward?._id?.toString() || admin.ward?.toString() || '',
  isActive: admin.isActive,
  password: '',
});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name:     form.name,
        email:    form.email,
        wardId:   form.wardId,
        isActive: form.isActive,
      };
      if (form.password.length >= 8) payload.password = form.password;
      await adminAPI.updateAdmin(admin._id, payload);
      toast.success('Admin updated successfully!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-600" />
            Edit Ward Admin
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="input-field" placeholder="Full name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="input-field" placeholder="Email address" />
          </div>
          <div>
            <label className="label">Assign to ward</label>
            <select value={form.wardId}
              onChange={(e) => setForm({...form, wardId: e.target.value})}
              className="input-field">
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  Ward {w.wardNumber} — {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">New password (leave blank to keep current)</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="input-field" placeholder="Min 8 characters" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 text-sm">Account status</p>
              <p className="text-xs text-gray-500">
                {form.isActive
                  ? 'Admin can login and manage complaints'
                  : 'Admin is blocked from logging in'}
              </p>
            </div>
            <button onClick={() => setForm({...form, isActive: !form.isActive})}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                ${form.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
              {form.isActive
                ? <><ToggleRight className="w-5 h-5" /> Active</>
                : <><ToggleLeft  className="w-5 h-5" /> Inactive</>}
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <LoadingSpinner size="sm" />
              : <><Save className="w-4 h-4" /> Save changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Ward Modal ───────────────────────────────────────────
const EditWardModal = ({ ward, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:       ward.name,
    wardNumber: ward.wardNumber,
    latitude:   ward.centerCoordinates?.coordinates[1] || '',
    longitude:  ward.centerCoordinates?.coordinates[0] || '',
    isActive:   ward.isActive,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await wardAPI.update(ward._id, {
        name:       form.name,
        wardNumber: form.wardNumber,
        isActive:   form.isActive,
        centerCoordinates: {
          type: 'Point',
          coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
        },
      });
      toast.success('Ward updated successfully!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-600" />
            Edit Ward
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Ward name</label>
            <input value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="input-field" />
          </div>
          <div>
            <label className="label">Ward number</label>
            <input type="number" value={form.wardNumber}
              onChange={(e) => setForm({...form, wardNumber: e.target.value})}
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input type="number" step="any" value={form.latitude}
                onChange={(e) => setForm({...form, latitude: e.target.value})}
                className="input-field" />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" step="any" value={form.longitude}
                onChange={(e) => setForm({...form, longitude: e.target.value})}
                className="input-field" />
            </div>
          </div>
          {/* Boundary info */}
<div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
  <p className="text-xs font-semibold text-amber-800 mb-1">
    📐 Ward boundary
  </p>
  <p className="text-xs text-amber-700">
    {ward.boundary?.coordinates?.length > 0
      ? '✅ Boundary polygon set — accurate assignment enabled'
      : '⚠️ No boundary set — using center distance (less accurate)'}
  </p>
</div>

{/* Active toggle */}
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
  <div>
    <p className="font-medium text-gray-900 text-sm">Ward status</p>
    <p className="text-xs text-gray-500">
      {form.isActive ? 'Ward accepts complaints' : 'Ward is deactivated'}
    </p>
  </div>
  <button onClick={() => setForm({...form, isActive: !form.isActive})}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
      ${form.isActive
        ? 'bg-green-100 text-green-700 hover:bg-green-200'
        : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
    {form.isActive
      ? <><ToggleRight className="w-5 h-5" /> Active</>
      : <><ToggleLeft  className="w-5 h-5" /> Inactive</>}
  </button>
</div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving
              ? <LoadingSpinner size="sm" />
              : <><Save className="w-4 h-4" /> Save changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminPage ────────────────────────────────────────────
const AdminPage = () => {
  const { admin }               = useAuthStore();
  const superAdmin              = admin?.role === 'super_admin';
  const [tab, setTab]           = useState('dashboard');
  const [stats, setStats]       = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [updating, setUpdating] = useState(null);
  const [wards, setWards]       = useState([]);
  const [admins, setAdmins]     = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [editingAdmin, setEditingAdmin]   = useState(null);
  const [editingWard,  setEditingWard]    = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deletingWard,  setDeletingWard]  = useState(null);
  const [wardForm, setWardForm] = useState({ name:'', wardNumber:'', latitude:'', longitude:'' });
  const [newWard,  setNewWard]  = useState({ name:'', wardNumber:'', latitude:'', longitude:'' });

  // ── Data loaders — defined BEFORE useEffects ─────────────────

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data.stats);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const fn = superAdmin ? adminAPI.getAllComplaints : adminAPI.getComplaints;
      const { data } = await fn();
      setComplaints(data.complaints || []);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [superAdmin]);

  const loadWards = useCallback(async () => {
    try {
      const { data } = await wardAPI.getAll();
      setWards(data.wards || []);
    } catch { toast.error('Failed to load wards'); }
  }, []);

  // Regular async — NOT useCallback to avoid stale closure
  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const { data } = await adminAPI.getAdmins();
      setAdmins(data.admins || []);
    } catch { toast.error('Failed to load admins'); }
    finally { setAdminsLoading(false); }
  };

  // ── Effects — defined AFTER all loaders ──────────────────────

  useEffect(() => {
    loadDashboard();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (tab === 'complaints') loadComplaints();
    if (tab === 'wards')      loadWards();
    if (tab === 'admins') {
      loadWards();
      loadAdmins();
    }
  }, [tab]); // eslint-disable-line

  // ── Action handlers ───────────────────────────────────────────

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminAPI.updateStatus(id, { status });
      setComplaints((prev) => prev.map((c) => c._id === id ? { ...c, status } : c));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const createWard = async (e) => {
    e.preventDefault();
    try {
      await wardAPI.create(newWard);
      toast.success('Ward created!');
      setNewWard({ name:'', wardNumber:'', latitude:'', longitude:'' });
      loadWards();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createWardAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createWardAdmin(wardForm);
      toast.success('Ward admin created!');
      setWardForm({ name:'', email:'', password:'', wardId:'' });
      loadAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const confirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    try {
      await adminAPI.deleteAdmin(deletingAdmin._id);
      toast.success('Ward admin deleted');
      setDeletingAdmin(null);
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || `Error: ${err.message}`);
    }
  };

  const confirmDeleteWard = async () => {
    if (!deletingWard) return;
    try {
      await wardAPI.remove(deletingWard._id);
      toast.success('Ward deactivated');
      setDeletingWard(null);
      loadWards();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const tabs = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints',  icon: FileText        },
    ...(superAdmin ? [
      { id: 'wards',  label: 'Wards',       icon: MapPin  },
      { id: 'admins', label: 'Ward Admins', icon: Users   },
    ] : []),
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">
              {admin?.name} · {superAdmin
                ? 'Super Admin'
                : `Ward Admin — ${admin?.ward?.name || ''}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${tab === id
                  ? 'bg-white shadow-sm text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div className="animate-fade-in">
            {loading
              ? <div className="card p-16 flex justify-center"><LoadingSpinner /></div>
              : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label:'Total',       value: stats?.total,      icon: FileText,      color:'bg-blue-50 text-blue-600'     },
                    { label:'Pending',     value: stats?.pending,    icon: Clock,         color:'bg-amber-50 text-amber-600'   },
                    { label:'In progress', value: stats?.inProgress, icon: AlertTriangle, color:'bg-indigo-50 text-indigo-600' },
                    { label:'Resolved',    value: stats?.resolved,   icon: CheckCircle,   color:'bg-green-50 text-green-600'   },
                  ].map((s) => (
                    <div key={s.label} className="card p-5 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{s.value ?? 0}</p>
                        <p className="text-sm text-gray-500">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── Complaints ── */}
        {tab === 'complaints' && (
          <div className="animate-fade-in space-y-4">
            {loading && (
              <div className="card p-16 flex justify-center">
                <LoadingSpinner text="Loading..." />
              </div>
            )}
            {!loading && complaints.length === 0 && (
              <div className="card p-16 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500">No complaints found</p>
              </div>
            )}
            {!loading && complaints.map((c) => {
              const cat    = getCategoryInfo(c.category);
              const emoji  = CATEGORY_EMOJIS[c.category] || '📌';
              const pLabel = priorityLabel(c.priority?.score || 0);
              return (
                <div key={c._id} className="card p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-gray-900">{c.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {cat.label} · {timeAgo(c.createdAt)} · {c.user?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pLabel.color}`}>
                            {pLabel.label}
                          </span>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="relative">
                          <select value={c.status}
                            onChange={(e) => updateStatus(c._id, e.target.value)}
                            disabled={updating === c._id}
                            className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g,' ').replace(/\b\w/g,(l) => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        {updating === c._id && <LoadingSpinner size="sm" />}
                        {c.ward && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Ward {c.ward.wardNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Wards ── */}
        {tab === 'wards' && superAdmin && (
          <div className="animate-fade-in space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Create new ward</h3>
                <form onSubmit={createWard} className="space-y-3">
                  <input value={newWard.name}
                    onChange={(e) => setNewWard({...newWard, name: e.target.value})}
                    className="input-field" placeholder="Ward name" required />
                  <input type="number" value={newWard.wardNumber}
                    onChange={(e) => setNewWard({...newWard, wardNumber: e.target.value})}
                    className="input-field" placeholder="Ward number" required />
                  <input type="number" step="any" value={newWard.latitude}
                    onChange={(e) => setNewWard({...newWard, latitude: e.target.value})}
                    className="input-field" placeholder="Center latitude (e.g. 27.7172)" required />
                  <input type="number" step="any" value={newWard.longitude}
                    onChange={(e) => setNewWard({...newWard, longitude: e.target.value})}
                    className="input-field" placeholder="Center longitude (e.g. 85.3240)" required />
                  <button type="submit" className="btn-primary w-full">Create ward</button>
                </form>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Existing wards ({wards.length})
                  </h3>
                  <button onClick={loadWards}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {wards.map((w) => (
                    <div key={w._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Ward {w.wardNumber} — {w.name}
                        </p>
                        <p className="text-xs text-gray-500">{w.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${w.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        <button onClick={() => setEditingWard(w)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg transition-all text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingWard(w)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {wards.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No wards yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Ward Admins ── */}
        {tab === 'admins' && superAdmin && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Create form */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Create ward admin
                </h3>
                <form onSubmit={createWardAdmin} className="space-y-3">
                  <input value={wardForm.name}
                    onChange={(e) => setWardForm({...wardForm, name: e.target.value})}
                    className="input-field" placeholder="Full name" required />
                  <input type="email" value={wardForm.email}
                    onChange={(e) => setWardForm({...wardForm, email: e.target.value})}
                    className="input-field" placeholder="Email address" required />
                  <input type="password" value={wardForm.password}
                    onChange={(e) => setWardForm({...wardForm, password: e.target.value})}
                    className="input-field" placeholder="Password (min 8 chars)"
                    required minLength={8} />
                  <select value={wardForm.wardId}
                    onChange={(e) => setWardForm({...wardForm, wardId: e.target.value})}
                    className="input-field" required>
                    <option value="">Select ward</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        Ward {w.wardNumber} — {w.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-primary w-full">
                    Create ward admin
                  </button>
                </form>
              </div>

              {/* Existing admins */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Ward admins ({admins.length})
                  </h3>
                  <button onClick={loadAdmins}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {adminsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Loading admins..." />
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-3">👤</p>
                    <p className="text-sm text-gray-400">No ward admins yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {admins.map((a) => (
                      <div key={a._id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-700 font-bold text-sm">
                            {a.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{a.name}</p>
                          <p className="text-xs text-gray-500 truncate">{a.email}</p>
                          {a.ward && (
                            <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium mt-0.5">
                              <MapPin className="w-3 h-3" />
                              Ward {a.ward.wardNumber} — {a.ward.name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`w-2 h-2 rounded-full ${a.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          <div className="flex gap-1">
                            <button onClick={() => setEditingAdmin(a)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-all">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeletingAdmin(a)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Full table */}
            {admins.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">All ward admins</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Name','Email','Ward','Status','Last login','Actions'].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a) => (
                        <tr key={a._id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-bold text-xs">
                                  {a.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{a.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{a.email}</td>
                          <td className="py-3 px-4">
                            {a.ward ? (
                              <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                                <MapPin className="w-3 h-3" />
                                Ward {a.ward.wardNumber} — {a.ward.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full
                              ${a.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full
                                ${a.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                              {a.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {a.lastLogin ? timeAgo(a.lastLogin) : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingAdmin(a)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button onClick={() => setDeletingAdmin(a)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Admin Modal ── */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          wards={wards}
          onClose={() => setEditingAdmin(null)}
          onSave={loadAdmins}
        />
      )}

      {/* ── Edit Ward Modal ── */}
      {editingWard && (
        <EditWardModal
          ward={editingWard}
          onClose={() => setEditingWard(null)}
          onSave={loadWards}
        />
      )}

      {/* ── Delete Admin Confirmation ── */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete ward admin?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{' '}
              <strong>{deletingAdmin.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingAdmin(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmDeleteAdmin} className="btn-danger flex-1">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Ward Confirmation ── */}
      {deletingWard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Deactivate ward?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>Ward {deletingWard.wardNumber} — {deletingWard.name}</strong> will
              be deactivated. Existing complaints won't be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingWard(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmDeleteWard} className="btn-danger flex-1">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;