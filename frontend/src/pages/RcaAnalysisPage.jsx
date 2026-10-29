import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveInvestigationThunk } from '../store/investigationSlice';
import { setActivePage } from '../store/uiSlice';
import FishboneDiagram from '../components/rca/FishboneDiagram';
import FiveWhysAccordion from '../components/rca/FiveWhysAccordion';
import EvidenceMatrix from '../components/evidence/EvidenceMatrix';
import StatusBadge from '../components/common/StatusBadge';
import { 
  GitFork, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  Save, 
  ShieldCheck, 
  Sparkles,
  FileText
} from 'lucide-react';

export const RcaAnalysisPage = () => {
  const dispatch = useDispatch();
  const draft = useSelector((state) => state.investigations.draft);
  const loading = useSelector((state) => state.investigations.loading);

  const [activeTab, setActiveTab] = useState('fishbone'); // 'fishbone', 'five-whys', 'evidence'

  const handleSave = async () => {
    await dispatch(saveInvestigationThunk(draft));
  };

  const handleProceedToCapa = () => {
    dispatch(setActivePage('capa-recommendations'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Investigation Dossier Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Batch: {draft.batch_number || 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-medium">{draft.product_name || 'Active Pharmaceutical Ingredient'}</span>
            <StatusBadge status={draft.status || 'RCA_COMPLETED'} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {draft.title || 'Root Cause Analysis Investigation'}
          </h1>
          <p className="text-xs text-rose-300/90 mt-1">
            <strong>Observed Issue:</strong> {draft.observed_issue || 'Not provided'}
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Analysis</span>
          </button>

          <button
            onClick={handleProceedToCapa}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to CAPA Actions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('fishbone')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'fishbone'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Ishikawa (6M) Fishbone Hypotheses ({draft.root_causes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('five-whys')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'five-whys'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5 Whys Progressive Analysis ({draft.five_whys_data?.length || 0} Levels)</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'evidence'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Evidence & Information Gaps ({draft.evidence_items?.length || 0})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'fishbone' && <FishboneDiagram />}
      {activeTab === 'five-whys' && <FiveWhysAccordion />}
      {activeTab === 'evidence' && <EvidenceMatrix />}
    </div>
  );
};

export default RcaAnalysisPage;
