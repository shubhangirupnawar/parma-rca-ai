import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDraftField, saveInvestigationThunk } from '../../store/investigationSlice';
import { setActivePage } from '../../store/uiSlice';
import { 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowRight, 
  FileCheck, 
  Layers, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const ExtractedFormReview = () => {
  const dispatch = useDispatch();
  const draft = useSelector((state) => state.investigations.draft);
  const loading = useSelector((state) => state.investigations.loading);

  const handleChange = (field, value) => {
    dispatch(updateDraftField({ field, value }));
  };

  const handleSaveOnly = async () => {
    await dispatch(saveInvestigationThunk(draft));
  };

  const handleProceedToRca = async () => {
    dispatch(setActivePage('rca-analysis'));
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-200 leading-relaxed">
          <strong className="text-white">AI-Extracted Quality Information:</strong> The incident narrative was processed by the AI extraction engine. Please review and edit the extracted metadata below. Any parameters missing from the source are preserved as <em>"Not provided"</em>.
        </div>
      </div>

      {/* Editable Form Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Incident Specification & Attributes</span>
          {draft.is_demo_mode && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Demo Simulation Mode
            </span>
          )}
        </h3>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Incident / Investigation Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={draft.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        {/* Row 1: Batch & Product */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Batch / Lot Number
            </label>
            <input
              type="text"
              value={draft.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product / API Name
            </label>
            <input
              type="text"
              value={draft.product_name || ''}
              onChange={(e) => handleChange('product_name', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Row 2: Department & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Manufacturing Department / Suite
            </label>
            <input
              type="text"
              value={draft.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Date of Incident / Occurrence
            </label>
            <input
              type="text"
              value={draft.incident_date || ''}
              onChange={(e) => handleChange('incident_date', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
        </div>

        {/* Observed Quality Issue */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Observed Quality Issue / Out-of-Specification (OOS) Details
          </label>
          <input
            type="text"
            value={draft.observed_issue || ''}
            onChange={(e) => handleChange('observed_issue', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-rose-300 font-medium focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Chronological Narrative & Technical Description
          </label>
          <textarea
            rows={5}
            value={draft.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleSaveOnly}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Draft Investigation</span>
          </button>

          <button
            onClick={handleProceedToRca}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to 6M Fishbone & 5 Whys Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtractedFormReview;
