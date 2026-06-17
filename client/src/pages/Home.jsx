import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, TrendingUp, CheckCircle,
  Clock, AlertTriangle, ChevronRight,
  ArrowRight,
} from 'lucide-react';
import MapView from '../components/Map/MapView';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import useComplaintStore from '../store/complaintStore';
import useAuthStore from '../store/authStore';
import { getCategoryInfo, timeAgo } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️',
  sewage_overflow:'🚰', flood:'🌊', pothole:'🕳️',
  broken_light:'💡', garbage:'🗑️', broken_footpath:'🚶',
  noise:'🔊', other:'📌',
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`rounded-2xl p-5 flex items-center gap-4 ${bg}`}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/30 flex-shrink-0">
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className={`text-sm font-medium ${color} opacity-80`}>{label}</p>
    </div>
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

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">

        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

  {/* Left side — Title and buttons */}
  <div>
    {/* Live badge */}
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
      </span>
      Live street issues map — Kathmandu Metropolitan City
    </div>

    <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
      Report street issues,<br />
      <span className="text-indigo-200">fix Kathmandu together</span>
    </h1>

    <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
      Street Care is an official street infrastructure complaint portal
      for Kathmandu Metropolitan City. Report issues directly to your ward office.
    </p>

    {/* CTA buttons */}
    {isUser() ? (
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/report"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base">
          <FileText className="w-5 h-5" />
          Report an issue
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/dashboard"
          className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-base">
          My reports
        </Link>
      </div>
    ) : (
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/register"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base">
          Get started free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/login"
          className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-base">
          Sign in
        </Link>
      </div>
    )}
  </div>

  {/* Right side — Warning/Disclaimer box */}
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">⚠️</span>
      <p className="font-bold text-white text-base">
        Important — Please read before reporting
      </p>
    </div>

    <div className="space-y-4">
      {/* Accepted */}
      <div>
        <p className="text-green-300 text-xs font-bold mb-2 flex items-center gap-1">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
          Accepted street issues:
        </p>
        <div className="space-y-1.5">
          {[
            '🛣️ Roads, potholes, road collapse',
            '💡 Streetlights, live wires, electrical',
            '🚰 Sewage overflow, flooding, drainage',
            
          ].map((item) => (
            <p key={item} className="text-white/80 text-xs flex items-center gap-2">
              <span className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0" />
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20" />

      {/* Not accepted */}
      <div>
        <p className="text-red-300 text-xs font-bold mb-2 flex items-center gap-1">
          <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">✕</span>
          NOT accepted — use these instead:
        </p>
        <div className="space-y-1.5">
          {[
            { text: 'Police / crime issues', number: '100', icon: '👮' },
            { text: 'Medical emergencies',   number: '102', icon: '🚑' },
            { text: 'Fire emergencies',      number: '101', icon: '🚒' },
          ].map((item) => (
            <div key={item.text}
              className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
              <p className="text-white/70 text-xs">
                {item.icon} {item.text}
              </p>
              <span className="font-bold text-red-300 text-sm">
                📞 {item.number}
              </span>
            </div>
          ))}
          <p className="text-white/60 text-xs flex items-center gap-2 mt-1">
            <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
            Outside KMC boundaries — not accepted
            <p className="text-white/60 text-xs flex items-center gap-2">
            <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
            Personal / social disputes — not accepted
          </p>
          </p>
          
        </div>
      </div>
    </div>
  </div>

</div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 900 0 720 0C540 0 240 60 0 30L0 60Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={TrendingUp}    label="Total reports" value={stats.total}
            color="text-blue-700"   bg="bg-blue-50 border border-blue-100" />
          <StatCard icon={Clock}         label="Pending"       value={stats.pending}
            color="text-amber-700"  bg="bg-amber-50 border border-amber-100" />
          <StatCard icon={AlertTriangle} label="In progress"   value={stats.progress}
            color="text-indigo-700" bg="bg-indigo-50 border border-indigo-100" />
          <StatCard icon={CheckCircle}   label="Resolved"      value={stats.resolved}
            color="text-green-700"  bg="bg-green-50 border border-green-100" />
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon:       '🏛️',
              title:      'Official KMC Portal',
              desc:       'Directly connected to all 32 ward offices of Kathmandu Metropolitan City',
              color:      'bg-blue-50 border-blue-100',
              titleColor: 'text-blue-800',
              descColor:  'text-blue-600',
            },
            {
              icon:       '🛣️',
              title:      'Street Issues Only',
              desc:       'For roads, utilities, sewage, lights and other physical infrastructure problems only',
              color:      'bg-indigo-50 border-indigo-100',
              titleColor: 'text-indigo-800',
              descColor:  'text-indigo-600',
            },
            {
              icon:       '📍',
              title:      'KMC Boundaries Only',
              desc:       'Only accepts complaints from within Kathmandu Metropolitan City boundaries',
              color:      'bg-amber-50 border-amber-100',
              titleColor: 'text-amber-800',
              descColor:  'text-amber-600',
            },
          ].map((card) => (
            <div key={card.title}
              className={`rounded-2xl p-4 border ${card.color} flex items-start gap-3`}>
              <span className="text-2xl flex-shrink-0">{card.icon}</span>
              <div>
                <p className={`font-bold text-sm ${card.titleColor}`}>{card.title}</p>
                <p className={`text-xs mt-0.5 leading-relaxed ${card.descColor}`}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Emergency numbers ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
            🚨 Emergency Numbers — Do NOT use Street Care for emergencies
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Police',    number: '100', icon: '👮', desc: 'Crime & Security' },
              { label: 'Ambulance', number: '102', icon: '🚑', desc: 'Medical Emergency' },
              { label: 'Fire',      number: '101', icon: '🚒', desc: 'Fire Emergency'   },
            ].map((e) => (
              <div key={e.label}
                className="bg-white rounded-xl p-3 text-center border border-red-100 hover:shadow-sm transition-all">
                <p className="text-2xl mb-1">{e.icon}</p>
                <p className="font-extrabold text-red-700 text-2xl">{e.number}</p>
                <p className="text-xs font-semibold text-red-600">{e.label}</p>
                <p className="text-xs text-red-400 mt-0.5">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

        {/* Mobile tab toggle */}
        <div className="flex lg:hidden bg-white border border-gray-200 p-1 rounded-2xl mb-4 shadow-sm">
          <button onClick={() => setShowMap(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${showMap ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            🗺️ Live Map
          </button>
          <button onClick={() => setShowMap(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${!showMap ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            📋 Reports ({mapComplaints.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Map ── */}
          <div className={`lg:col-span-2 ${!showMap ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Live street issue map</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click any pin to see issue details
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { key: 'all',         label: 'All'      },
                    { key: 'pending',     label: 'Pending'  },
                    { key: 'in_progress', label: 'Active'   },
                    { key: 'resolved',    label: 'Resolved' },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all
                        ${filter === key
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-3">
                {[
                  { color: 'bg-amber-400',  label: 'Pending'     },
                  { color: 'bg-indigo-500', label: 'In progress' },
                  { color: 'bg-green-500',  label: 'Resolved'    },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${l.color} shadow-sm`} />
                    <span className="text-xs text-gray-500 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-100"
                style={{ height: '460px' }}>
                {loading
                  ? <div className="h-full flex items-center justify-center bg-gray-50">
                      <LoadingSpinner text="Loading map..." />
                    </div>
                  : <MapView complaints={filtered} />}
              </div>
            </div>
          </div>

          {/* ── Recent reports ── */}
          <div className={`${showMap ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'} gap-3`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Recent reports</h2>
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
                  <p className="text-4xl mb-3">🛣️</p>
                  <p className="text-gray-500 text-sm font-medium">No street issues reported yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to report an issue!</p>
                  {!isUser() && (
                    <Link to="/register"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-indigo-600 font-semibold hover:underline">
                      Sign up to report <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              {!loading && mapComplaints.slice(0, 8).map((c) => {
                const cat   = getCategoryInfo(c.category);
                const emoji = CATEGORY_EMOJIS[c.category] || '📌';
                return (
                  <Link key={c._id} to={`/complaint/${c._id}`}
                    className="group flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 block">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cat.label} · {timeAgo(c.createdAt)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* CTA for non-logged in users */}
            {!isUser() && mapComplaints.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
                <p className="font-bold text-base mb-1">See a street issue nearby?</p>
                <p className="text-indigo-100 text-xs mb-4">
                  Create a free account and report it to your ward office in under 2 minutes.
                </p>
                <Link to="/register"
                  className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">
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
          className="fixed bottom-6 right-6 z-30 lg:hidden w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
          <FileText className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
};

export default Home;