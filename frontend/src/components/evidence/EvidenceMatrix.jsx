import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  toggleEvidenceCollected, 
  addEvidenceItem, 
  removeEvidenceItem 
} from '../../store/investigationSlice';
import { 
  CheckSquare, 
  Square, 
  FileCheck2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileText,
  Clock,
  Layers
} from 'lucide-react';

export const EvidenceMatrix = () => {
  const dispatch = useDispatch();
  const evidenceItems = useSelector(
    (state) => state.investigations.draft.evidence_items || []
  );

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('MISSING');
  const [newRef, setNewRef] = useState('');

  const providedItems = evidenceItems.filter((e) => e.item_type === 'AVAILABLE');
  const missingItems = evidenceItems.filter((e) => e.item_type === 'MISSING');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dispatch(
      addEvidenceItem({
        item_type: newType,
        title: newTitle.trim(),
        description: 'Added by quality investigator',
        source_reference: newRef.trim() || 'Internal QA Requirement',
        is_collected: newType === 'AVAILABLE',
      })
    );

    setNewTitle('');
    setNewRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Evidence Verification & Information Gap Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clearly distinguishing objective evidence gathered from records that must still be retrieved to validate root causes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            {providedItems.length} Available
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
            {missingItems.filter((m) => !m.is_collected).length} Missing
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Available Evidence */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <FileCheck2 className="w-4 h-4" />
              <span>Evidence Available in Record ({providedItems.length})</span>
            </div>
          </div>

          <div className="space-y-3">
            {providedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No provided evidence records logged.
              </div>
            ) : (
              providedItems.map((item, idx) => {
                const originalIndex = evidenceItems.findIndex((e) => e === item);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white leading-snug">
                          {item.title}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {item.source_reference && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Ref: {item.source_reference}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch(removeEvidenceItem(originalIndex))}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Missing Evidence Required */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Critical Missing Evidence Required ({missingItems.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Click to check off when acquired</span>
          </div>

          <div className="space-y-3">
            {missingItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                All required evidence items have been accounted for.
              </div>
            ) : (
              missingItems.map((item, idx) => {
                const originalIndex = evidenceItems.findIndex((e) => e === item);
                return (
                  <div
                    key={idx}
                    onClick={() => dispatch(toggleEvidenceCollected(originalIndex))}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      item.is_collected
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/90 border-amber-900/40 hover:border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-amber-400">
                        {item.is_collected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-xs font-semibold leading-snug ${
                            item.is_collected ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {item.title}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {item.source_reference && (
                          <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                            Target Source: {item.source_reference}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeEvidenceItem(originalIndex));
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Evidence Requirement */}
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="w-full sm:w-44">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          >
            <option value="MISSING">Missing Evidence (Gap)</option>
            <option value="AVAILABLE">Available Evidence</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Evidence item (e.g. SCADA Historian trend, RTD Calibration log)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />

        <input
          type="text"
          placeholder="Source / Dept..."
          value={newRef}
          onChange={(e) => setNewRef(e.target.value)}
          className="w-full sm:w-48 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="w-full sm:w-auto px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Evidence Item</span>
        </button>
      </form>
    </div>
  );
};

export default EvidenceMatrix;
