import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePage } from '../../store/uiSlice';
import { 
  LayoutDashboard, 
  PlusCircle, 
  GitFork, 
  FileText, 
  ShieldCheck, 
  Beaker, 
  Activity, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const activePage = useSelector((state) => state.ui.activePage);
  const currentInvestigation = useSelector((state) => state.investigations.currentInvestigation);
  const draft = useSelector((state) => state.investigations.draft);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-investigation', label: 'New Investigation', icon: PlusCircle },
    { id: 'rca-analysis', label: 'RCA Analysis (Fishbone/5Y)', icon: GitFork },
    { id: 'investigation-details', label: 'Investigation Dossier', icon: FileText },
    { id: 'capa-recommendations', label: 'CAPA Action Center', icon: ShieldCheck },
  ];

  const hasActiveInvestigation = Boolean(currentInvestigation?.id || draft?.root_causes?.length);

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">PharmaRCA</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">API v1.0</span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">Root Cause Decision Support</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Quality Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setActivePage(item.id))}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-teal-400" />}
              </button>
            );
          })}
        </nav>

        {/* Active Investigation Context Pill */}
        {hasActiveInvestigation && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-teal-400 font-medium">
                <Sparkles className="w-3 h-3" /> In Scope
              </span>
              <span className="font-mono text-[10px] text-slate-400">{draft.batch_number || 'Draft'}</span>
            </div>
            <div className="text-xs font-semibold text-white line-clamp-1">
              {draft.product_name || draft.title || 'Untitled API Batch'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{draft.root_causes?.length || 0} Causes</span>
              <span>{draft.capa_recommendations?.length || 0} CAPAs</span>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span className="font-medium text-slate-300">GxP / 21 CFR Part 11</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-tight">
          Qualified human review required before batch release.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
