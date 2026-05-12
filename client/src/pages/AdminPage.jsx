import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, MapPin,
  CheckCircle, Clock, AlertTriangle,
  ChevronDown, Shield,
} from 'lucide-react';
import { adminAPI, wardAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getCategoryInfo, timeAgo, priorityLabel } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire:'⚡',gas_leak:'💨',road_collapse:'🛣️',sewage_overflow:'🚰',
  flood:'🌊',pothole:'🕳️',broken_light:'💡',garbage:'🗑️',
  broken_footpath:'🚶',noise:'🔊',other:'📌',
};

const STATUSES = ['pending','under_review','in_progress','resolved','rejected'];

const AdminPage = () => {
  const { admin, isSuperAdmin } = useAuthStore();
  const [tab, setTab]               = useState('dashboard');
  const [stats, setStats]           = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [updating, setUpdating]     = useState(null);
  const [wards, setWards]           = useState([]);

  // Create ward admin form
  const [wardForm, setWardForm] = useState({ name:'', email:'', password:'', wardId:'' });
  // Create ward form
  const [newWard, setNewWard]   = useState({ name:'', wardNumber:'', latitude:'', longitude:'' });

 useEffect(() => { loadDashboard(); }, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { if (tab === 'complaints') loadComplaints(); }, [tab]);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { if (isSuperAdmin() && tab === 'wards') loadWards(); }, [tab]);
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data.stats);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const fn = isSuperAdmin() ? adminAPI.getAllComplaints : adminAPI.getComplaints;
      const { data } = await fn();
      setComplaints(data.complaints);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  const loadWards = async () => {
    const { data } = await wardAPI.getAll();
    setWards(data.wards);
  };

  const updateStatus = async (id, status, note = '') => {
    setUpdating(id);
    try {
      await adminAPI.updateStatus(id, { status, note });
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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const tabs = [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints',  icon: FileText        },
    ...(isSuperAdmin() ? [
      { id: 'wards',    label: 'Wards',       icon: MapPin          },
      { id: 'admins',   label: 'Ward Admins', icon: Users           },
    ] : []),
  ];

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
              {admin?.name} · {admin?.role === 'super_admin' ? 'Super Admin' : `Ward Admin — ${admin?.ward?.name || ''}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${tab === id ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <div className="animate-fade-in">
            {loading ? <div className="card p-16 flex justify-center"><LoadingSpinner /></div> : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label:'Total',      value: stats?.total,      icon: FileText,       color:'bg-blue-50 text-blue-600'     },
                    { label:'Pending',    value: stats?.pending,    icon: Clock,          color:'bg-amber-50 text-amber-600'   },
                    { label:'In progress',value: stats?.inProgress, icon: AlertTriangle,  color:'bg-indigo-50 text-indigo-600' },
                    { label:'Resolved',   value: stats?.resolved,   icon: CheckCircle,    color:'bg-green-50 text-green-600'   },
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
              </>
            )}
          </div>
        )}

        {/* Complaints tab */}
        {tab === 'complaints' && (
          <div className="animate-fade-in space-y-4">
            {loading && <div className="card p-16 flex justify-center"><LoadingSpinner text="Loading complaints..." /></div>}
            {!loading && complaints.length === 0 && (
              <div className="card p-16 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500">No complaints found</p>
              </div>
            )}
            {!loading && complaints.map((c) => {
              const cat   = getCategoryInfo(c.category);
              const emoji = CATEGORY_EMOJIS[c.category] || '📌';
              const pLabel= priorityLabel(c.priority?.score || 0);

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

                      {/* Status updater */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="relative">
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c._id, e.target.value)}
                            disabled={updating === c._id}
                            className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        {updating === c._id && <LoadingSpinner size="sm" />}
                        {c.ward && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Ward {c.ward.wardNumber}
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

        {/* Wards tab */}
        {tab === 'wards' && isSuperAdmin() && (
          <div className="animate-fade-in grid sm:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Create new ward</h3>
              <form onSubmit={createWard} className="space-y-3">
                <input value={newWard.name} onChange={(e) => setNewWard({...newWard, name: e.target.value})}
                  className="input-field" placeholder="Ward name" required />
                <input type="number" value={newWard.wardNumber} onChange={(e) => setNewWard({...newWard, wardNumber: e.target.value})}
                  className="input-field" placeholder="Ward number" required />
                <input type="number" step="any" value={newWard.latitude} onChange={(e) => setNewWard({...newWard, latitude: e.target.value})}
                  className="input-field" placeholder="Center latitude (e.g. 27.7172)" required />
                <input type="number" step="any" value={newWard.longitude} onChange={(e) => setNewWard({...newWard, longitude: e.target.value})}
                  className="input-field" placeholder="Center longitude (e.g. 85.3240)" required />
                <button type="submit" className="btn-primary w-full">Create ward</button>
              </form>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Existing wards ({wards.length})</h3>
              <div className="space-y-2">
                {wards.map((w) => (
                  <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Ward {w.wardNumber} — {w.name}</p>
                      <p className="text-xs text-gray-500">{w.city}</p>
                    </div>
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                ))}
                {wards.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No wards yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Ward Admins tab */}
        {tab === 'admins' && isSuperAdmin() && (
          <div className="animate-fade-in">
            <div className="card p-6 max-w-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Create ward admin</h3>
              <form onSubmit={createWardAdmin} className="space-y-3">
                <input value={wardForm.name} onChange={(e) => setWardForm({...wardForm, name: e.target.value})}
                  className="input-field" placeholder="Full name" required />
                <input type="email" value={wardForm.email} onChange={(e) => setWardForm({...wardForm, email: e.target.value})}
                  className="input-field" placeholder="Email address" required />
                <input type="password" value={wardForm.password} onChange={(e) => setWardForm({...wardForm, password: e.target.value})}
                  className="input-field" placeholder="Password (min 8 chars)" required minLength={8} />
                <select value={wardForm.wardId} onChange={(e) => setWardForm({...wardForm, wardId: e.target.value})}
                  className="input-field" required>
                  <option value="">Select ward</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>Ward {w.wardNumber} — {w.name}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary w-full">Create ward admin</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;