import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, MapPin, ThumbsUp } from 'lucide-react';
import useComplaintStore from '../store/complaintStore';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/UI/StatusBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getCategoryInfo, timeAgo, priorityLabel } from '../utils/helpers';

const CATEGORY_EMOJIS = {
  live_wire:'⚡',gas_leak:'💨',road_collapse:'🛣️',sewage_overflow:'🚰',
  flood:'🌊',pothole:'🕳️',broken_light:'💡',garbage:'🗑️',
  broken_footpath:'🚶',noise:'🔊',other:'📌',
};

const DashboardPage = () => {
  const { myComplaints, fetchMyComplaints, loading } = useComplaintStore();
  const { user } = useAuthStore();

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { fetchMyComplaints(); }, []);

  const stats = {
    total:    myComplaints.length,
    pending:  myComplaints.filter((c) => c.status === 'pending').length,
    progress: myComplaints.filter((c) => ['under_review','in_progress'].includes(c.status)).length,
    resolved: myComplaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My reports</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <Link to="/report" className="btn-primary">
            <FileText className="w-4 h-4" /> New report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',      value: stats.total,    icon: FileText,       color: 'bg-blue-50 text-blue-600'     },
            { label: 'Pending',    value: stats.pending,  icon: Clock,          color: 'bg-amber-50 text-amber-600'   },
            { label: 'In progress',value: stats.progress, icon: AlertTriangle,  color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Resolved',   value: stats.resolved, icon: CheckCircle,    color: 'bg-green-50 text-green-600'   },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Complaints list */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">All your reports</h2>

          {loading && (
            <div className="card p-16 flex items-center justify-center">
              <LoadingSpinner text="Loading your reports..." />
            </div>
          )}

          {!loading && myComplaints.length === 0 && (
            <div className="card p-16 text-center">
              <p className="text-5xl mb-4">📋</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-500 text-sm mb-6">Start by reporting an issue in your area</p>
              <Link to="/report" className="btn-primary inline-flex">
                Report first issue
              </Link>
            </div>
          )}

          {!loading && myComplaints.map((c) => {
            const cat    = getCategoryInfo(c.category);
            const emoji  = CATEGORY_EMOJIS[c.category] || '📌';
            const pLabel = priorityLabel(c.priority?.score || 0);

            return (
              <div key={c._id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-gray-900">{c.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{cat.label} · {timeAgo(c.createdAt)}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {c.ward && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          Ward {c.ward.wardNumber} — {c.ward.name}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pLabel.color}`}>
                        {pLabel.label} priority
                      </span>
                      {c.upvotes?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {c.upvotes.length} upvotes
                        </span>
                      )}
                    </div>

                    {c.adminNote && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                        <strong>Admin note:</strong> {c.adminNote}
                      </div>
                    )}

                    {c.photos?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {c.photos.map((p, i) => (
                          <img key={i}
                            src={`http://localhost:5000${p.url}`}
                            alt=""
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;