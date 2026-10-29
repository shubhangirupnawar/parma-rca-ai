import React, { useState } from 'react';
import ConfidenceBadge from '../common/ConfidenceBadge';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const RootCauseCard = ({ 
  cause, 
  index, 
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [title, setTitle] = useState(cause.hypothesis_title || '');
  const [desc, setDesc] = useState(cause.description || '');
  const [why, setWhy] = useState(cause.why_considered || '');
  const [confidence, setConfidence] = useState(cause.confidence_level || 'Moderate Hypothesis');
  const [category, setCategory] = useState(cause.category || 'Method');

  const handleSaveEdit = () => {
    onUpdate(index, {
      ...cause,
      hypothesis_title: title,
      description: desc,
      why_considered: why,
      confidence_level: confidence,
      category: category,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(cause.hypothesis_title || '');
    setDesc(cause.description || '');
    setWhy(cause.why_considered || '');
    setConfidence(cause.confidence_level || 'Moderate Hypothesis');
    setCategory(cause.category || 'Method');
    setIsEditing(false);
  };

  const categories = ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'];
  const confidenceLevels = ['High Confidence', 'Moderate Hypothesis', 'Low / Needs Verification'];

  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 space-y-3 animate-fade-in shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-teal-300">Edit Root Cause Hypothesis</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveEdit}
              className="p-1 rounded bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs flex items-center gap-1 px-2"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1 px-2"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold uppercase">Fishbone Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold uppercase">Confidence Status</label>
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              {confidenceLevels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-semibold uppercase">Hypothesis Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-semibold uppercase">Failure Mechanism Description</label>
          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-semibold uppercase">Why Considered</label>
          <textarea
            rows={2}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {cause.category}
            </span>
            <ConfidenceBadge confidence={cause.confidence_level} />
            <span className="text-[11px] text-slate-400 italic">Investigative Hypothesis</span>
          </div>
          <h4 className="text-sm font-semibold text-white leading-snug">
            {cause.hypothesis_title}
          </h4>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit hypothesis"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete hypothesis"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2.5">
          <p className="leading-relaxed">{cause.description}</p>
          
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
            <strong className="text-teal-400 block mb-0.5">Why Considered:</strong>
            <span className="text-slate-300">{cause.why_considered}</span>
          </div>

          {/* Supporting & Contradictory Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {cause.supporting_evidence?.length > 0 && (
              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                <strong className="block font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Supporting Evidence:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {cause.supporting_evidence.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {cause.contradictory_evidence?.length > 0 && (
              <div className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-amber-300">
                <strong className="block font-semibold mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Gaps / Contradictions:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {cause.contradictory_evidence.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCauseCard;
