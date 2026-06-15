import { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: '',             label: 'All statuses'  },
  { value: 'pending',      label: 'Pending'       },
  { value: 'under_review', label: 'Under Review'  },
  { value: 'in_progress',  label: 'In Progress'   },
  { value: 'resolved',     label: 'Resolved'      },
  { value: 'rejected',     label: 'Rejected'      },
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority (highest first)' },
  { value: 'newest',   label: 'Newest first'             },
  { value: 'oldest',   label: 'Oldest first'             },
  { value: 'status',   label: 'By status'                },
];

const SearchFilter = ({
  onFilter,
  showSort    = false,
  showWard    = false,
  wards       = [],
  placeholder = 'Search complaints...',
}) => {
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [category,    setCategory]    = useState('');
  const [wardId,      setWardId]      = useState('');
  const [sortBy,      setSortBy]      = useState('priority');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [status, category, wardId].filter(Boolean).length;

  const apply = useCallback(() => {
    onFilter({ search, status, category, wardId, sortBy });
  }, [search, status, category, wardId, sortBy, onFilter]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  const timer = setTimeout(() => apply(), 400);
  return () => clearTimeout(timer);
}, [search]);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { apply(); }, [status, category, wardId, sortBy]);

  const clearAll = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setWardId('');
    setSortBy('priority');
  };

  const hasAnyFilter = search || status || category || wardId;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-10"
            placeholder={placeholder}
            autoComplete="off"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
            ${showFilters || activeFilterCount > 0
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasAnyFilter && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all">
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="input-field appearance-none pr-8 text-sm py-2">
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="input-field appearance-none pr-8 text-sm py-2">
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {showWard && wards.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ward</label>
                <div className="relative">
                  <select value={wardId} onChange={(e) => setWardId(e.target.value)}
                    className="input-field appearance-none pr-8 text-sm py-2">
                    <option value="">All wards</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>Ward {w.wardNumber} — {w.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {showSort && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Sort by</label>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="input-field appearance-none pr-8 text-sm py-2">
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {status && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                  {STATUS_OPTIONS.find(o => o.value === status)?.label}
                  <button onClick={() => setStatus('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                  {CATEGORIES.find(c => c.value === category)?.label}
                  <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {wardId && wards.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                  {wards.find(w => w._id === wardId)?.name}
                  <button onClick={() => setWardId('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;