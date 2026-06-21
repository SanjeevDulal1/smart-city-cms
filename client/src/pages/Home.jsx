import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, TrendingUp, CheckCircle, Clock, AlertTriangle,
  ChevronRight, ArrowRight, MapPin, Building2, Navigation,
  Phone, Ambulance, Flame, Shield,
} from 'lucide-react';
import MapView from '../components/Map/MapView';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import useComplaintStore from '../store/complaintStore';
import useAuthStore from '../store/authStore';
import { getCategoryInfo, timeAgo } from '../utils/helpers';

const CATEGORY_LABELS = {
  live_wire: 'Live Wire',
  gas_leak: 'Gas Leak',
  road_collapse: 'Road Collapse',
  sewage_overflow: 'Sewage',
  flood: 'Flood',
  pothole: 'Pothole',
  broken_light: 'Broken Light',
  garbage: 'Garbage',
  broken_footpath: 'Footpath',
  noise: 'Noise',
  other: 'Other',
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2 bg-white/12 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/15">
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-white/90 text-xs font-semibold">{value}</span>
    <span className="text-white/50 text-xs">{label}</span>
  </div>
);

const Home = () => {
  const { mapComplaints, fetchMapComplaints, loading } = useComplaintStore();
  const { isUser } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [showMap, setShowMap] = useState(true);

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
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-16">

      {/* ── COMPACT HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-indigo-600">

        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Two-column: title left | buttons right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            {/* LEFT — Title + subtitle + stat pills */}
            <div className="flex-1 min-w-0">
              {/* Live badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-white/80 mb-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
                Live · Kathmandu Metropolitan City
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-1">
                Street Care
              </h1>
              <p className="text-indigo-200 text-sm sm:text-base">
                Street Complaint Management System · KMC
              </p>

              {/* Stat pills row */}
              <div className="flex flex-wrap gap-2 mt-4">
                <StatPill icon={TrendingUp}    label="total"    value={stats.total}    color="text-blue-300" />
                <StatPill icon={Clock}         label="pending"  value={stats.pending}  color="text-amber-300" />
                <StatPill icon={AlertTriangle} label="active"   value={stats.progress} color="text-violet-300" />
                <StatPill icon={CheckCircle}   label="resolved" value={stats.resolved} color="text-green-300" />
              </div>
            </div>

            {/* RIGHT — CTA buttons + scope note */}
            <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
              {isUser() ? (
                <div className="flex gap-2">
                  <Link to="/report"
                    className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all shadow-lg text-sm">
                    <FileText className="w-4 h-4" />
                    Report an issue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/dashboard"
                    className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm">
                    My reports
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/register"
                    className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-all shadow-lg text-sm">
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/login"
                    className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm">
                    Sign in
                  </Link>
                </div>
              )}

              {/* Scope pills — replaces warning box */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/8 border border-white/12 rounded-lg px-2.5 py-1">
                  <Building2 className="w-3 h-3" />
                  Official KMC portal
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/8 border border-white/12 rounded-lg px-2.5 py-1">
                  <Navigation className="w-3 h-3" />
                  KMC boundaries only
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/8 border border-white/12 rounded-lg px-2.5 py-1">
                  <Shield className="w-3 h-3" />
                  Street issues only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thin wave — minimal version */}
        <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden">
          <svg viewBox="0 0 1440 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 12L1440 12L1440 6C1200 12 900 0 720 0C540 0 240 12 0 6L0 12Z" fill="#f9fafb" />
          </svg>
        </div>
      </div>

      {/* ── EMERGENCY BANNER — slim, no emoji icons ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3 mb-4">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex-wrap">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wide flex-shrink-0">
            Not for emergencies
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <Phone className="w-3 h-3" />
              Police · 100
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <Ambulance className="w-3 h-3" />
              Ambulance · 102
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <Flame className="w-3 h-3" />
              Fire · 101
            </span>
          </div>
          <span className="text-xs text-red-400 ml-auto hidden sm:block">
            This system only handles street infrastructure issues
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT — Map + Reports ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* Mobile tab toggle */}
        <div className="flex lg:hidden bg-white border border-gray-200 p-1 rounded-2xl mb-4 shadow-sm">
          <button onClick={() => setShowMap(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${showMap ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <MapPin className="w-4 h-4" />
            Live Map
          </button>
          <button onClick={() => setShowMap(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${!showMap ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FileText className="w-4 h-4" />
            Reports ({mapComplaints.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── MAP ── */}
          <div className={`lg:col-span-2 ${!showMap ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {/* Map header */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Live street issue map</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Click any pin to see details</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: 'all',         label: 'All'      },
                    { key: 'pending',     label: 'Pending'  },
                    { key: 'in_progress', label: 'Active'   },
                    { key: 'resolved',    label: 'Resolved' },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all
                        ${filter === key
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mb-3">
                {[
                  { color: 'bg-amber-400',  label: 'Pending'     },
                  { color: 'bg-indigo-500', label: 'In progress' },
                  { color: 'bg-green-500',  label: 'Resolved'    },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    <span className="text-xs text-gray-400 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-100" style={{ height: '420px' }}>
                {loading
                  ? <div className="h-full flex items-center justify-center bg-gray-50">
                      <LoadingSpinner text="Loading map..." />
                    </div>
                  : <MapView complaints={filtered} />}
              </div>
            </div>
          </div>

          {/* ── RECENT REPORTS ── */}
          <div className={`${showMap ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} gap-3`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base">Recent reports</h2>
              {mapComplaints.length > 0 && (
                <span className="text-xs text-gray-400">{mapComplaints.length} total</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              {loading && (
                <div className="bg-white rounded-2xl p-8 flex justify-center border border-gray-100">
                  <LoadingSpinner />
                </div>
              )}

              {!loading && mapComplaints.length === 0 && (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No issues reported yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to report one</p>
                  {!isUser() && (
                    <Link to="/register"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-indigo-600 font-semibold hover:underline">
                      Sign up to report <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              {!loading && mapComplaints.slice(0, 8).map((c) => {
                const cat = getCategoryInfo(c.category);
                const label = CATEGORY_LABELS[c.category] || 'Other';
                return (
                  <Link key={c._id} to={`/complaint/${c._id}`}
                    className="group flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all block">
                    {/* Category color dot instead of emoji */}
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {label} · {timeAgo(c.createdAt)}
                      </p>
                      <div className="mt-1.5">
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* CTA card for guests */}
            {!isUser() && mapComplaints.length > 0 && (
              <div className="bg-indigo-600 rounded-2xl p-4 text-white">
                <p className="font-bold text-sm mb-1">See an issue nearby?</p>
                <p className="text-indigo-200 text-xs mb-3">
                  Report it to your ward office in under 2 minutes.
                </p>
                <Link to="/register"
                  className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-bold text-sm px-3.5 py-1.5 rounded-xl hover:bg-indigo-50 transition-all">
                  Report now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile FAB */}
      {isUser() && (
        <Link to="/report"
          className="fixed bottom-6 right-6 z-30 lg:hidden w-13 h-13 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ width: '52px', height: '52px' }}>
          <FileText className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
};

export default Home;
