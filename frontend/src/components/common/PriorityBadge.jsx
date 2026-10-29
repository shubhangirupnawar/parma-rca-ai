import React from 'react';

const priorityConfig = {
  CRITICAL: 'bg-rose-950 text-rose-300 border-rose-800',
  HIGH: 'bg-amber-950 text-amber-300 border-amber-800',
  MEDIUM: 'bg-yellow-950 text-yellow-300 border-yellow-800',
  LOW: 'bg-slate-800 text-slate-300 border-slate-700',
};

export const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'MEDIUM').toUpperCase();
  const style = priorityConfig[norm] || priorityConfig.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${style}`}>
      {norm}
    </span>
  );
};

export default PriorityBadge;
