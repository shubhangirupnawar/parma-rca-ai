import React from 'react';

export const ConfidenceBadge = ({ confidence }) => {
  const conf = confidence || 'Moderate Hypothesis';
  
  let color = 'bg-blue-950 text-blue-300 border-blue-800';
  if (conf.includes('High')) {
    color = 'bg-emerald-950 text-emerald-300 border-emerald-800';
  } else if (conf.includes('Low') || conf.includes('Needs')) {
    color = 'bg-amber-950 text-amber-300 border-amber-800';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {conf}
    </span>
  );
};

export default ConfidenceBadge;
