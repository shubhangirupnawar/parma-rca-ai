import React from 'react';
import { useSelector } from 'react-redux';
import { FileText, GitFork, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';

export const MetricsOverview = () => {
  const investigations = useSelector((state) => state.investigations.investigations);

  const total = investigations.length;
  const inProgress = investigations.filter((i) => ['DRAFT', 'EXTRACTED', 'RCA_COMPLETED'].includes(i.status)).length;
  const pendingReview = investigations.filter((i) => i.status === 'PENDING_HUMAN_REVIEW').length;
  const verified = investigations.filter((i) => i.is_human_verified || i.status === 'APPROVED').length;

  const cards = [
    {
      label: 'Total Quality Incidents',
      value: total,
      sub: 'All registered investigations',
      icon: FileText,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'RCA Underway',
      value: inProgress,
      sub: 'Active causal analyses',
      icon: GitFork,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Pending QA Verification',
      value: pendingReview,
      sub: 'Awaiting human sign-off',
      icon: AlertOctagon,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'CAPA Approved & Closed',
      value: verified,
      sub: 'GxP compliant resolution',
      icon: CheckCircle2,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
            <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
