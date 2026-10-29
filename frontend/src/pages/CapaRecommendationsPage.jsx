import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveInvestigationThunk } from '../store/investigationSlice';
import CapaTable from '../components/capa/CapaTable';
import StatusBadge from '../components/common/StatusBadge';
import { ShieldCheck, Save, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const CapaRecommendationsPage = () => {
  const dispatch = useDispatch();
  const draft = useSelector((state) => state.investigations.draft);
  const loading = useSelector((state) => state.investigations.loading);

  const capas = draft.capa_recommendations || [];
  const approvedCount = capas.filter((c) => c.human_status === 'APPROVED').length;
  const pendingCount = capas.filter((c) => c.human_status === 'PENDING_REVIEW' || !c.human_status).length;

  const handleSave = async () => {
    await dispatch(saveInvestigationThunk(draft));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Batch: {draft.batch_number || 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-medium">{draft.product_name || 'Active API'}</span>
            <StatusBadge status={draft.status || 'CAPA_PENDING'} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            CAPA Action Center (Corrective, Preventive & Verification)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {draft.title || 'Pharmaceutical Quality Incident CAPA Program'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono mr-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
              {approvedCount} Approved
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
              {pendingCount} Pending Review
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Save CAPA Program</span>
          </button>
        </div>
      </div>

      <CapaTable />
    </div>
  );
};

export default CapaRecommendationsPage;
