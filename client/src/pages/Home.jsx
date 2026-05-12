import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import MapView from '../components/Map/MapView';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import useComplaintStore from '../store/complaintStore';
import useAuthStore from '../store/authStore';
import { getCategoryInfo, timeAgo } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire: '⚡', gas_leak: '💨', road_collapse: '🛣️',
  sewage_overflow: '🚰', flood: '🌊', pothole: '🕳️',
  broken_light: '💡', garbage: '🗑️', broken_footpath: '🚶',
  noise: '🔊', other: '📌',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Home = () => {
  const { mapComplaints, fetchMapComplaints, loading } = useComplaintStore();
  const { isUser } = useAuthStore();
  const [filter, setFilter] = useState('all');

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchMapComplaints(); }, []);

  const filtered = filter === 'all'
    ? mapComplaints
    : mapComplaints.filter((c) => c.status === filter);

  const stats = {
    total:    mapComplaints.length,
    pending:  mapComplaints.filter((c) => c.status === 'pending').length,
    progress: mapComplaints.filter((c) => c.status === 'in_progress').length,
    resolved: mapComplaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live complaints map — Kathmandu
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Report city issues,<br />
              <span className="text-indigo-200">make Kathmandu better</span>
            </h1>
            <p className="text-indigo-100 text-lg mb-8">
              See real-time complaints from your community and track their resolution on the live map.
            </p>
            {isUser() ? (
              <Link to="/report"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl">
                <FileText className="w-5 h-5" />
                Report an issue
              </Link>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <Link to="/register"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
                  Get started free
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={TrendingUp}    label="Total reports" value={stats.total}    color="bg-blue-50 text-blue-600" />
          <StatCard icon={Clock}         label="Pending"        value={stats.pending}  color="bg-amber-50 text-amber-600" />
          <StatCard icon={AlertTriangle} label="In progress"    value={stats.progress} color="bg-indigo-50 text-indigo-600" />
          <StatCard icon={CheckCircle}   label="Resolved"       value={stats.resolved} color="bg-green-50 text-green-600" />
        </div>

        {/* Map + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-semibold text-gray-900">Live complaint map</h2>
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'pending', 'in_progress', 'resolved'].map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all
                        ${filter === s
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s === 'all' ? 'All' : s === 'in_progress' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Map legend */}
              <div className="flex gap-4 mb-3 flex-wrap">
                {[
                  { color: 'bg-amber-400', label: 'Pending' },
                  { color: 'bg-indigo-500', label: 'In progress' },
                  { color: 'bg-green-500', label: 'Resolved' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-3 h-3 rounded-full ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
              <div style={{ height: '460px' }}>
                {loading
                  ? <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl">
                      <LoadingSpinner text="Loading map..." />
                    </div>
                  : <MapView complaints={filtered} />}
              </div>
            </div>
          </div>

          {/* Recent list */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Recent reports</h2>
            <div className="space-y-2">
              {mapComplaints.slice(0, 8).map((c) => {
                const cat = getCategoryInfo(c.category);
                const emoji = CATEGORY_EMOJIS[c.category] || '📌';
                return (
                  <div key={c._id} className="card-hover p-4 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.label} · {timeAgo(c.createdAt)}</p>
                        <div className="mt-2">
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {mapComplaints.length === 0 && !loading && (
                <div className="card p-10 text-center">
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="text-gray-500 text-sm">No complaints yet.<br />Be the first to report an issue!</p>
                  {!isUser() && (
                    <Link to="/register" className="btn-primary mt-4 text-sm py-2">
                      Sign up to report
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;