import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateDraftField, 
  saveInvestigationThunk, 
  verifyInvestigationThunk 
} from '../store/investigationSlice';
import StatusBadge from '../components/common/StatusBadge';
import { 
  FileCheck2, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Layers, 
  AlertTriangle,
  Beaker,
  Printer
} from 'lucide-react';

export const InvestigationDetailsPage = () => {
  const dispatch = useDispatch();
  const currentInvestigation = useSelector((state) => state.investigations.currentInvestigation);
  const draft = useSelector((state) => state.investigations.draft);
  const loading = useSelector((state) => state.investigations.loading);

  const [reviewerName, setReviewerName] = useState(draft.human_reviewer_name || '');
  const [reviewNotes, setReviewNotes] = useState(draft.human_review_notes || '');

  const handleChange = (field, value) => {
    dispatch(updateDraftField({ field, value }));
  };

  const handleSave = async () => {
    await dispatch(saveInvestigationThunk(draft));
  };

  const handleSignOff = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    if (draft.id) {
      await dispatch(
        verifyInvestigationThunk({
          id: draft.id,
          reviewer_name: reviewerName.trim(),
          review_notes: reviewNotes.trim(),
        })
      );
    } else {
      // If saving for the first time with sign-off
      const updated = {
        ...draft,
        is_human_verified: true,
        human_reviewer_name: reviewerName.trim(),
        human_review_notes: reviewNotes.trim(),
        status: 'APPROVED',
      };
      await dispatch(saveInvestigationThunk(updated));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Dossier Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              ID: {draft.id ? draft.id.substring(0, 8) : 'Unsaved Draft'}
            </span>
            <StatusBadge status={draft.status || 'DRAFT'} />
            {draft.is_human_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> QA Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {draft.title || 'Pharmaceutical Quality Dossier'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manufacturing Quality Investigation & Root Cause Record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Basic Attributes Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Manufacturing Batch Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Batch Number</span>
            <input
              type="text"
              value={draft.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              className="mt-1 w-full bg-transparent text-teal-300 font-mono font-bold focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">API Product Name</span>
            <input
              type="text"
              value={draft.product_name || ''}
              onChange={(e) => handleChange('product_name', e.target.value)}
              className="mt-1 w-full bg-transparent text-white font-semibold focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
            <input
              type="text"
              value={draft.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              className="mt-1 w-full bg-transparent text-white focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Incident</span>
            <input
              type="text"
              value={draft.incident_date || ''}
              onChange={(e) => handleChange('incident_date', e.target.value)}
              className="mt-1 w-full bg-transparent text-white font-mono focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Observed Quality Issue / Defect Specification:
          </label>
          <textarea
            rows={2}
            value={draft.observed_issue || ''}
            onChange={(e) => handleChange('observed_issue', e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-rose-300 font-medium focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Complete Incident Narrative & Chronology:
          </label>
          <textarea
            rows={5}
            value={draft.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* Formal QA Professional Sign-Off Block */}
      <form
        onSubmit={handleSignOff}
        className={`p-6 rounded-2xl border transition-all ${
          draft.is_human_verified
            ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-semibold text-white">
              Qualified Quality Professional Sign-Off (GxP & 21 CFR Part 11)
            </h3>
          </div>
          {draft.is_human_verified ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Electronically Verified & Approved</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
              Pending Human Verification
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          I hereby confirm that I have reviewed the AI-assisted root cause hypotheses, missing evidence matrix, and proposed CAPA actions. I certify that this causal determination meets pharmaceutical quality requirements and standard operating procedures.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Authorized Reviewer Name & Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Robert Chen, VP Quality Assurance"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Verification Timestamp
            </label>
            <div className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
              {draft.verification_timestamp
                ? new Date(draft.verification_timestamp).toLocaleString()
                : 'Generated upon electronic signature'}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Formal Review Summary & Disposition Notes
          </label>
          <textarea
            rows={3}
            placeholder="Document formal disposition, batch quarantine release instructions, or MRB findings..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={!reviewerName.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{draft.is_human_verified ? 'Update Formal Sign-Off' : 'Authorize & Sign Investigation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestigationDetailsPage;
