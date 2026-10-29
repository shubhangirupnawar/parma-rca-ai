import React from 'react';

const statusConfig = {
  DRAFT: { label: 'Draft', bg: 'bg-slate-800 text-slate-300 border-slate-700' },
  EXTRACTED: { label: 'AI Extracted', bg: 'bg-sky-950 text-sky-400 border-sky-800' },
  RCA_COMPLETED: { label: 'RCA Completed', bg: 'bg-indigo-950 text-indigo-400 border-indigo-800' },
  PENDING_HUMAN_REVIEW: { label: 'Review Required', bg: 'bg-amber-950 text-amber-400 border-amber-800' },
  APPROVED: { label: 'QA Verified & Approved', bg: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status || 'Unknown', bg: 'bg-slate-800 text-slate-300 border-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
