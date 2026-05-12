export const CATEGORIES = [
  { value: 'live_wire',       label: 'Live Wire',        color: '#ef4444', emoji: '⚡' },
  { value: 'gas_leak',        label: 'Gas Leak',         color: '#f97316', emoji: '💨' },
  { value: 'road_collapse',   label: 'Road Collapse',    color: '#dc2626', emoji: '🛣️' },
  { value: 'sewage_overflow', label: 'Sewage Overflow',  color: '#92400e', emoji: '🚰' },
  { value: 'flood',           label: 'Flood',            color: '#1d4ed8', emoji: '🌊' },
  { value: 'pothole',         label: 'Pothole',          color: '#ca8a04', emoji: '🕳️' },
  { value: 'broken_light',    label: 'Broken Light',     color: '#7c3aed', emoji: '💡' },
  { value: 'garbage',         label: 'Garbage',          color: '#65a30d', emoji: '🗑️' },
  { value: 'broken_footpath', label: 'Broken Footpath',  color: '#0891b2', emoji: '🚶' },
  { value: 'noise',           label: 'Noise Pollution',  color: '#db2777', emoji: '🔊' },
  { value: 'other',           label: 'Other',            color: '#6b7280', emoji: '📌' },
];

export const STATUS_CONFIG = {
  pending:      { label: 'Pending',      color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400'  },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'   },
  in_progress:  { label: 'In Progress',  color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-700',   dot: 'bg-green-400'  },
  rejected:     { label: 'Rejected',     color: 'bg-red-100 text-red-700',       dot: 'bg-red-400'    },
};

export const MAP_PIN_COLORS = {
  pending:      '#f59e0b',
  under_review: '#3b82f6',
  in_progress:  '#6366f1',
  resolved:     '#10b981',
  rejected:     '#ef4444',
};

export const getCategoryInfo = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const priorityLabel = (score) => {
  if (score >= 8) return { label: 'Critical',  color: 'text-red-600 bg-red-50'    };
  if (score >= 6) return { label: 'High',       color: 'text-orange-600 bg-orange-50' };
  if (score >= 4) return { label: 'Medium',     color: 'text-yellow-600 bg-yellow-50' };
  return               { label: 'Low',          color: 'text-green-600 bg-green-50'   };
};