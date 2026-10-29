import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateDraftField } from '../../store/investigationSlice';
import { GitCommit, ArrowDown, HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

export const FiveWhysAccordion = () => {
  const dispatch = useDispatch();
  const fiveWhys = useSelector((state) => state.investigations.draft.five_whys_data || []);

  const handleUpdateStep = (index, field, value) => {
    const updated = [...fiveWhys];
    updated[index] = { ...updated[index], [field]: value };
    dispatch(updateDraftField({ field: 'five_whys_data', value: updated }));
  };

  if (!fiveWhys || fiveWhys.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No 5 Whys Analysis Generated Yet</p>
        <p className="text-slate-400 mt-1">Run AI Root Cause Analysis to synthesize the 5 sequential causal steps.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>5 Whys Progressive Causal Analysis</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Systematic drill-down from observed pharmaceutical defect to root systemic mechanism
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-teal-500/10 text-teal-300 border border-teal-500/30">
          5 Causal Levels
        </span>
      </div>

      <div className="space-y-4 relative">
        {fiveWhys.map((step, idx) => {
          const isRoot = idx === fiveWhys.length - 1;

          return (
            <div key={idx} className="relative">
              {idx > 0 && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isRoot
                    ? 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border-teal-500/50 shadow-lg shadow-teal-950/20'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isRoot
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {step.level || idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {isRoot ? 'Level 5 (Root Systemic Cause)' : `Why Stage ${idx + 1}`}
                    </span>
                  </div>

                  {isRoot && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                      <CheckCircle className="w-3 h-3 text-teal-400" /> Root Cause Identified
                    </span>
                  )}
                </div>

                {/* Question */}
                <div className="mb-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Question:</label>
                  <input
                    type="text"
                    value={step.question || ''}
                    onChange={(e) => handleUpdateStep(idx, 'question', e.target.value)}
                    className="w-full mt-0.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">
                    Answer / Finding:
                  </label>
                  <textarea
                    rows={2}
                    value={step.answer || ''}
                    onChange={(e) => handleUpdateStep(idx, 'answer', e.target.value)}
                    className="w-full mt-0.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FiveWhysAccordion;
