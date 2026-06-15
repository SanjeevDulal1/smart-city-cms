import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  MapPin, ThumbsUp, ChevronLeft, ChevronRight,
  ChevronRight as Arrow,
} from 'lucide-react';
import { complaintAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchFilter from '../components/UI/SearchFilter';
import { getCategoryInfo, timeAgo, priorityLabel } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️',
  sewage_overflow:'🚰', flood:'🌊', pothole:'🕳️',
  broken_light:'💡', garbage:'🗑️', broken_footpath:'🚶',
  noise:'🔊', other:'📌',
};

const STATUS_BORDER = {
  pending:      'border-l-amber-400',
  under_review: 'border-l-blue-400',
  in_progress:  'border-l-indigo-500',
  resolved:     'border-l-green-500',
  rejected:     'border-l-red-400',
};

const getImageUrl = (url) => {
  if (url?.startsWith('http')) return url;
  const base = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${url}`;
};

const DashboardPage = () => {
  const { user }                    = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters]       = useState({});

  const loadComplaints = useCallback(async (page = 1, activeFilters = {}) => {
    setLoading(true);
    try {
      const { data } = await complaintAPI.getMyComplaints({
        page, limit: 10, ...activeFilters,
      });
      setComplaints(data.complaints || []);
      setPagination(data.pagination || { page: 1, total: 0, pages: 1 });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints(1, filters);
  }, [filters, loadComplaints]);

  const handleFilter = useCallback((f) => setFilters(f), []);
  const handlePage   = (p) => loadComplaints(p, filters);

  const stats = [
    { label: 'Total',       value: pagination.total || 0, icon: FileText,      bg: 'bg-blue-50',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   border: 'border-blue-100'   },
    { label: 'Pending',     value: complaints.filter(c => c.status === 'pending').length,                                       icon: Clock,         bg: 'bg-amber-50',  iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  border: 'border-amber-100'  },
    { label: 'In progress', value: complaints.filter(c => ['under_review','in_progress'].includes(c.status)).length,            icon: AlertTriangle, bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', border: 'border-indigo-100' },
    { label: 'Resolved',    value: complaints.filter(c => c.status === 'resolved').length,                                      icon: CheckCircle,   bg: 'bg-green-50',  iconBg: 'bg-green-100',  iconColor: 'text-green-600',  border: 'border-green-100'  },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12"
      style={{ background: 'linear-gradient(180deg, #f0f1ff 0%, #f9fafb 20%)' }}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My reports</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.name?.split(' ')[0]}</span>
            </p>
          </div>
          <Link to="/report"
            className="btn-primary px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-200">
            <FileText className="w-4 h-4" />
            New report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label}
              className={`rounded-2xl p-4 border ${s.bg} ${s.border} flex items-center gap-3`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <SearchFilter
          onFilter={handleFilter}
          placeholder="Search your complaints..."
        />

        {/* Count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total === 0
              ? 'No complaints found'
              : `Showing ${complaints.length} of ${pagination.total} complaint${pagination.total !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading && (
            <div className="bg-white rounded-2xl p-16 flex items-center justify-center border border-gray-100">
              <LoadingSpinner text="Loading your reports..." />
            </div>
          )}

          {!loading && complaints.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
              <p className="text-5xl mb-4">📋</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 text-sm mb-6">
                Try adjusting your filters or report a new issue
              </p>
              <Link to="/report" className="btn-primary inline-flex text-sm py-2.5">
                Report an issue
              </Link>
            </div>
          )}

          {!loading && complaints.map((c) => {
            const cat    = getCategoryInfo(c.category);
            const emoji  = CATEGORY_EMOJIS[c.category] || '📌';
            const pLabel = priorityLabel(c.priority?.score || 0);
            const borderColor = STATUS_BORDER[c.status] || 'border-l-gray-300';

            return (
              <Link key={c._id} to={`/complaint/${c._id}`}
                className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor}
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">

                    {/* Emoji icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                            {c.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {cat.label} · {timeAgo(c.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={c.status} />
                          <Arrow className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {c.ward && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <MapPin className="w-3 h-3" />
                            Ward {c.ward.wardNumber} — {c.ward.name}
                          </span>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${pLabel.color}`}>
                          {pLabel.label} priority
                        </span>
                        {c.upvotes?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="w-3 h-3" />
                            {c.upvotes.length}
                          </span>
                        )}
                      </div>

                      {c.adminNote && (
                        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
                          💬 Admin: {c.adminNote}
                        </div>
                      )}

                      {c.photos?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {c.photos.map((p, i) => (
                            <div key={i} className="relative">
                              <img
                                src={getImageUrl(p.url)}
                                alt={`Evidence ${i + 1}`}
                                className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          ))}
                          {c.photos.length > 0 && (
                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                              View all
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => handlePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary py-2 px-3 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - pagination.page) <= 2)
              .map((p) => (
                <button key={p} onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                    ${p === pagination.page
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
            <button onClick={() => handlePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary py-2 px-3 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;