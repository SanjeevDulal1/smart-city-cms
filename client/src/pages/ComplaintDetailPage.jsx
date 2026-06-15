import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft, MapPin, Clock, ThumbsUp, Shield,
  CheckCircle, AlertTriangle, X, ChevronRight,
  User, Calendar, Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getCategoryInfo, formatDate, timeAgo, priorityLabel } from '../utils/helpers';

// ── Leaflet pin ───────────────────────────────────────────────
const reportPin = L.divIcon({
  className: '',
  html: `<div style="
    width:24px;height:24px;
    background:#4f46e5;
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 3px 10px rgba(0,0,0,0.3);
  "></div>`,
  iconSize:   [24, 24],
  iconAnchor: [12, 24],
});

// ── Status timeline config ────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'pending',      label: 'Submitted',    icon: '📋', desc: 'Complaint received and verified'          },
  { key: 'under_review', label: 'Under Review', icon: '🔍', desc: 'Being reviewed by ward admin'             },
  { key: 'in_progress',  label: 'In Progress',  icon: '🔧', desc: 'Work has started on this issue'           },
  { key: 'resolved',     label: 'Resolved',     icon: '✅', desc: 'Issue has been fixed'                    },
];

const STATUS_ORDER = ['pending', 'under_review', 'in_progress', 'resolved'];

const CATEGORY_EMOJIS = {
  live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️',
  sewage_overflow:'🚰', flood:'🌊', pothole:'🕳️',
  broken_light:'💡', garbage:'🗑️', broken_footpath:'🚶',
  noise:'🔊', other:'📌',
};
const getImageUrl = (url) => {
  const base = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${url}`;
};

// ── Lightbox ──────────────────────────────────────────────────
const Lightbox = ({ photos, index, onClose }) => {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <X className="w-5 h-5" />
      </button>

      <div className="relative max-w-4xl max-h-screen p-4 w-full"
        onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img
          src={getImageUrl(photos[current].url)}
          alt={`Photo ${current + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-2xl"
        />

        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all
                  ${i === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}

        {current > 0 && (
          <button onClick={() => setCurrent(current - 1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
        {current < photos.length - 1 && (
          <button onClick={() => setCurrent(current + 1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <p className="text-center text-white/50 text-sm mt-3">
          {current + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────
const ComplaintDetailPage = () => {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const { user, isUser }                = useAuthStore();
  const [complaint, setComplaint]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [upvoting, setUpvoting]         = useState(false);
  const [lightbox, setLightbox]         = useState({ open: false, index: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await complaintAPI.getById(id);
        setComplaint(data.complaint);
      } catch {
        toast.error('Complaint not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleUpvote = async () => {
    if (!isUser()) {
      toast.error('Please sign in to upvote');
      return;
    }
    setUpvoting(true);
    try {
      const { data } = await complaintAPI.upvote(id);
      setComplaint((prev) => ({
        ...prev,
        upvotes: data.upvoted
          ? [...(prev.upvotes || []), user._id]
          : (prev.upvotes || []).filter((u) => u !== user._id),
      }));
      toast.success(data.upvoted ? 'Upvoted!' : 'Upvote removed');
    } catch {
      toast.error('Failed to upvote');
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading complaint..." />
    </div>
  );

  if (!complaint) return null;

  const cat          = getCategoryInfo(complaint.category);
  const emoji        = CATEGORY_EMOJIS[complaint.category] || '📌';
  const pLabel       = priorityLabel(complaint.priority?.score || 0);
  const [lng, lat]   = complaint.location?.coordinates || [85.3240, 27.7172];
  const currentStep  = STATUS_ORDER.indexOf(complaint.status);
  const hasUpvoted   = user && complaint.upvotes?.includes(user._id);
  const upvoteCount  = complaint.upvotes?.length || 0;
  const isRejected   = complaint.status === 'rejected';

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: 'linear-gradient(180deg, #f0f1ff 0%, #f9fafb 20%)' }}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* ── Header card ── */}
        <div className="card p-6 mb-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="text-5xl flex-shrink-0">{emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {cat.label}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pLabel.color}`}>
                    {pLabel.label} priority
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {complaint.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {complaint.ward && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      Ward {complaint.ward.wardNumber} — {complaint.ward.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo(complaint.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(complaint.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-mono text-xs">{complaint._id?.slice(-8)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Upvote button */}
            <button onClick={handleUpvote} disabled={upvoting}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 transition-all duration-200
                ${hasUpvoted
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:text-indigo-500'}`}>
              <ThumbsUp className={`w-6 h-6 transition-transform ${upvoting ? 'scale-75' : hasUpvoted ? 'scale-110' : ''}`} />
              <span className="text-lg font-bold">{upvoteCount}</span>
              <span className="text-xs font-medium">{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mb-4">

          {/* ── Photos ── */}
          {complaint.photos?.length > 0 && (
            <div className="lg:col-span-3 card p-5 animate-fade-in">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📸</span> Photos ({complaint.photos.length})
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {complaint.photos.map((photo, i) => (
                  <div key={i} onClick={() => setLightbox({ open: true, index: i })}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-gray-100">
                    <img
                      src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photo.url}`}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                      <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Mini map ── */}
          <div className={`${complaint.photos?.length > 0 ? 'lg:col-span-2' : 'lg:col-span-5'} card p-5 animate-fade-in`}>
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📍</span> Location
            </h2>
            <div style={{ height: '200px' }} className="rounded-xl overflow-hidden border border-gray-100">
              <MapContainer
                center={[lat, lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} icon={reportPin} />
              </MapContainer>
            </div>
            {complaint.location?.address && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {complaint.location.address}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="card p-6 mb-4 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📝</span> Description
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* ── Admin note ── */}
        {complaint.adminNote && (
          <div className="card p-6 mb-4 border-l-4 border-indigo-500 animate-fade-in">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Note from admin
            </h2>
            <p className="text-gray-700 leading-relaxed">{complaint.adminNote}</p>
          </div>
        )}

        {/* ── Status Timeline ── */}
        <div className="card p-6 mb-4 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>🚀</span>
            Track your complaint
            <span className="text-xs font-normal text-gray-400 ml-1">
              — like tracking a courier package
            </span>
          </h2>

          {isRejected ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-700">Complaint Rejected</p>
                <p className="text-sm text-red-500 mt-0.5">
                  {complaint.adminNote || 'This complaint could not be processed.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 hidden sm:block" />
              <div
                className="absolute top-6 left-6 h-0.5 bg-indigo-500 hidden sm:block transition-all duration-700"
                style={{
                  width: currentStep <= 0 ? '0%'
                    : currentStep >= TIMELINE_STEPS.length - 1 ? 'calc(100% - 3rem)'
                    : `calc(${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}% - 1.5rem)`,
                }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 relative">
                {TIMELINE_STEPS.map((step, i) => {
                  const isDone    = i < currentStep || (complaint.status === 'resolved' && i === TIMELINE_STEPS.length - 1);
                  const isCurrent = i === currentStep && complaint.status !== 'resolved';
                  const historyEntry = complaint.statusHistory?.find(
                    (h) => h.status === step.key
                  );

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center px-2">
                      {/* Circle */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                        mb-3 transition-all duration-500 border-2
                        ${isDone
                          ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200'
                          : isCurrent
                          ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200 animate-pulse-slow'
                          : 'bg-white border-gray-200'}`}>
                        {isDone
                          ? <CheckCircle className="w-6 h-6 text-white" />
                          : isCurrent
                          ? <span>{step.icon}</span>
                          : <span className="text-gray-300">{step.icon}</span>}
                      </div>

                      {/* Label */}
                      <p className={`text-sm font-semibold mb-1 transition-colors
                        ${isDone ? 'text-green-600'
                          : isCurrent ? 'text-indigo-700'
                          : 'text-gray-400'}`}>
                        {step.label}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-gray-400 leading-tight mb-1">
                        {step.desc}
                      </p>

                      {/* Timestamp from history */}
                      {historyEntry && (
                        <p className="text-xs text-gray-400 font-medium">
                          {formatDate(historyEntry.changedAt)}
                        </p>
                      )}

                      {/* Current indicator */}
                      {isCurrent && (
                        <span className="mt-1 text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Status History Log ── */}
        {complaint.statusHistory?.length > 0 && (
          <div className="card p-6 mb-4 animate-fade-in">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📜</span> Activity log
            </h2>
            <div className="space-y-3">
              {[...complaint.statusHistory].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {entry.changedBy
                      ? <Shield className="w-4 h-4 text-indigo-500" />
                      : <User  className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={entry.status} size="sm" />
                      <span className="text-xs text-gray-400">
                        {entry.changedAt ? timeAgo(entry.changedAt) : ''}
                      </span>
                      {entry.changedBy && (
                        <span className="text-xs text-indigo-600 font-medium">
                          by {entry.changedBy.name || 'Admin'}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg px-3 py-2">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {entry.changedAt ? formatDate(entry.changedAt) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reporter info ── */}
        <div className="card p-5 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {complaint.user?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">Reported this issue</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {complaint.priority?.score > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <AlertTriangle className="w-4 h-4" />
                  Priority score: <strong className="text-gray-900">{complaint.priority.score}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Back to dashboard link ── */}
        {isUser() && (
          <div className="text-center mt-6">
            <Link to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              View all my complaints →
            </Link>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox.open && complaint.photos?.length > 0 && (
        <Lightbox
          photos={complaint.photos}
          index={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}
    </div>
  );
};

export default ComplaintDetailPage;