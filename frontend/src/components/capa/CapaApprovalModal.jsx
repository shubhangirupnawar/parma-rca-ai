import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, XCircle, Edit3, ShieldAlert } from 'lucide-react';

export const CapaApprovalModal = ({ isOpen, onClose, capa, onApprove }) => {
  const [action, setAction] = useState('APPROVED');
  const [reviewerName, setReviewerName] = useState('');
  const [notes, setNotes] = useState('');

  if (!capa) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    onApprove({
      action,
      reviewer_name: reviewerName.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GxP Qualified Professional Review & Sign-Off">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Warning pill */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Under 21 CFR Part 11 and ICH Q10, this electronic signature confirms formal review and authorization by a qualified quality authority.
          </span>
        </div>

        {/* Action Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-mono font-semibold uppercase text-slate-400">
            Selected Action ({capa.action_type}):
          </div>
          <p className="font-semibold text-white leading-relaxed">{capa.action_description}</p>
          <div className="text-slate-400 text-[11px]">
            Target Department: <strong className="text-teal-300">{capa.suggested_department}</strong>
          </div>
        </div>

        {/* Approval Decision */}
        <div>
          <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Quality Decision
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVED')}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                action === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approve</span>
            </button>

            <button
              type="button"
              onClick={() => setAction('MODIFIED')}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                action === 'MODIFIED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Modify</span>
            </button>

            <button
              type="button"
              onClick={() => setAction('REJECTED')}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                action === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* Reviewer Name */}
        <div>
          <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Reviewer Full Name & Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Eleanor Vance, QA Compliance Director"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Verification Notes */}
        <div>
          <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Technical Justification & Verification Notes
          </label>
          <textarea
            rows={3}
            placeholder="Document rationale, change control references (CC-xxxx), or required protocol specifics..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reviewerName.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 text-slate-950 font-semibold disabled:opacity-50"
          >
            Record Formal Sign-Off
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CapaApprovalModal;
