import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvestigationById } from '../../store/investigationSlice';
import { setActivePage } from '../../store/uiSlice';
import StatusBadge from '../common/StatusBadge';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle, 
  FileText, 
  Calendar, 
  Layers, 
  ArrowUpRight,
  Plus
} from 'lucide-react';

export const RecentInvestigationsTable = () => {
  const dispatch = useDispatch();
  const investigations = useSelector((state) => state.investigations.investigations);
  const loading = useSelector((state) => state.investigations.loading);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = investigations.filter((inv) => {
    const matchesSearch =
      search === '' ||
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.product_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectInvestigation = (id, targetPage = 'investigation-details') => {
    dispatch(fetchInvestigationById(id));
    dispatch(setActivePage(targetPage));
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Quality Investigations Dossier</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manufacturing deviations, OOS alerts, and audit trails</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batch, product, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 w-52 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="EXTRACTED">AI Extracted</option>
              <option value="RCA_COMPLETED">RCA Completed</option>
              <option value="PENDING_HUMAN_REVIEW">Review Required</option>
              <option value="APPROVED">QA Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-5">Incident / Investigation Title</th>
              <th className="py-3 px-4">Batch #</th>
              <th className="py-3 px-4">Product / API</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">QA Verification</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-slate-400" />
                    <p className="text-sm font-medium">No investigations found</p>
                    <p className="text-xs text-slate-400">Submit a new manufacturing incident to initiate AI RCA.</p>
                    <button
                      onClick={() => dispatch(setActivePage('new-investigation'))}
                      className="mt-3 px-3.5 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-xl hover:bg-teal-500/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Start New Investigation
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => handleSelectInvestigation(inv.id)}
                >
                  <td className="py-3.5 px-5 font-medium text-white max-w-xs">
                    <div className="truncate font-semibold group-hover:text-teal-300 transition-colors">
                      {inv.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{inv.incident_date || 'Undated'}</span>
                      {inv.is_demo_mode && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px]">
                          Simulated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-teal-400 font-medium">
                    {inv.batch_number || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {inv.product_name || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {inv.department || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.is_human_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Signed Off
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Pending QA</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectInvestigation(inv.id, 'rca-analysis')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 text-[11px] font-medium"
                      >
                        Fishbone / 5Y
                      </button>
                      <button
                        onClick={() => handleSelectInvestigation(inv.id, 'capa-recommendations')}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/20 text-[11px] font-medium"
                      >
                        CAPA
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvestigationsTable;
