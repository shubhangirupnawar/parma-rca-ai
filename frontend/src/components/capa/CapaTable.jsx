import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateCapaItem, 
  removeCapaItem, 
  addCapaItem, 
  reviewCapaActionThunk,
  saveInvestigationThunk 
} from '../../store/investigationSlice';
import PriorityBadge from '../common/PriorityBadge';
import CapaApprovalModal from './CapaApprovalModal';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  UserCheck, 
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CapaTable = () => {
  const dispatch = useDispatch();
  const currentInvestigation = useSelector((state) => state.investigations.currentInvestigation);
  const draft = useSelector((state) => state.investigations.draft);
  const capas = draft.capa_recommendations || [];

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'CORRECTIVE', 'PREVENTIVE', 'EFFECTIVENESS_VERIFICATION'
  const [selectedCapaForApproval, setSelectedCapaForApproval] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Capa state
  const [newType, setNewType] = useState('CORRECTIVE');
  const [newDesc, setNewDesc] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newDept, setNewDept] = useState('Quality Assurance');
  const [newPriority, setNewPriority] = useState('HIGH');

  const filteredCapas = capas.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.action_type === activeTab;
  });

  const handleOpenApproval = (capa) => {
    setSelectedCapaForApproval(capa);
  };

  const handleApproveAction = async (payload) => {
    if (currentInvestigation?.id && selectedCapaForApproval?.id) {
      // Direct API update
      await dispatch(
        reviewCapaActionThunk({
          investigationId: currentInvestigation.id,
          capaId: selectedCapaForApproval.id,
          ...payload,
        })
      );
    } else {
      // Local draft update
      const index = capas.findIndex((c) => c === selectedCapaForApproval);
      if (index !== -1) {
        dispatch(
          updateCapaItem({
            index,
            updatedItem: {
              ...selectedCapaForApproval,
              human_status: payload.action,
              approved_by: payload.reviewer_name,
              human_notes: payload.notes,
              approved_at: new Date().toISOString(),
            },
          })
        );
      }
    }
  };

  const handleAddCapaSubmit = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    dispatch(
      addCapaItem({
        action_type: newType,
        action_description: newDesc.trim(),
        reason_for_recommendation: newReason.trim() || 'Internal quality enhancement',
        supporting_evidence: 'Identified during root cause analysis',
        suggested_department: newDept,
        suggested_priority: newPriority,
        human_status: 'PENDING_REVIEW',
      })
    );

    setNewDesc('');
    setNewReason('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* GxP Human Review Requirement Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-white">Mandatory Quality Control Notice:</strong> AI-recommended Corrective and Preventive Actions (CAPA) are decision-support suggestions only. In accordance with GMP / FDA regulations, <strong>no action is automatically approved or executed</strong> without formal sign-off by a qualified pharmaceutical quality professional.
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CORRECTIVE', 'PREVENTIVE', 'EFFECTIVENESS_VERIFICATION'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL'
                ? `All Actions (${capas.length})`
                : tab === 'EFFECTIVENESS_VERIFICATION'
                ? 'Effectiveness Verification'
                : `${tab.charAt(0) + tab.slice(1).toLowerCase()} Actions`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>Add Custom CAPA</span>
        </button>
      </div>

      {/* New CAPA Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddCapaSubmit}
          className="p-5 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-4 animate-fade-in"
        >
          <h4 className="text-sm font-semibold text-white">Create Quality Action Item</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Action Classification</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="CORRECTIVE">Corrective Action (Containment / Remediation)</option>
                <option value="PREVENTIVE">Preventive Action (Systemic Recurrence Prevention)</option>
                <option value="EFFECTIVENESS_VERIFICATION">Verification of Effectiveness</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Responsible Department</label>
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Suggested Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Action Plan Description</label>
            <textarea
              rows={2}
              required
              placeholder="Specify the exact containment, procedural change, engineering interlock, or testing protocol..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Reason & Scientific Finding</label>
            <input
              type="text"
              placeholder="Why this action is mandatory..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-semibold text-xs"
            >
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* CAPA Action Cards */}
      <div className="space-y-3.5">
        {filteredCapas.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No CAPA recommendations found in this category</p>
          </div>
        ) : (
          filteredCapas.map((capa, idx) => {
            const originalIndex = capas.findIndex((c) => c === capa);
            const isApproved = capa.human_status === 'APPROVED';
            const isRejected = capa.human_status === 'REJECTED';
            const isModified = capa.human_status === 'MODIFIED';

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isApproved
                    ? 'bg-slate-950/90 border-emerald-500/40'
                    : isRejected
                    ? 'bg-slate-950/90 border-rose-500/30 opacity-75'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {capa.action_type}
                      </span>
                      <PriorityBadge priority={capa.suggested_priority} />
                      <span className="text-[11px] text-teal-300 font-medium bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                        Dept: {capa.suggested_department}
                      </span>

                      {/* Human Status Indicator */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isRejected
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : isModified
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {isRejected && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {!isApproved && !isRejected && <Clock className="w-3 h-3 text-slate-400" />}
                        <span>{capa.human_status || 'PENDING_REVIEW'}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <h4 className="text-sm font-semibold text-white leading-relaxed">
                      {capa.action_description}
                    </h4>

                    {/* Rationale & Evidence */}
                    <div className="text-xs text-slate-300 space-y-1 pt-1">
                      <div>
                        <strong className="text-slate-400">Scientific Rationale: </strong>
                        <span>{capa.reason_for_recommendation}</span>
                      </div>
                      {capa.supporting_evidence && (
                        <div>
                          <strong className="text-slate-400">Supporting Finding: </strong>
                          <span className="text-slate-400">{capa.supporting_evidence}</span>
                        </div>
                      )}
                    </div>

                    {/* Approval Sign-Off Metadata */}
                    {capa.approved_by && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                        <div>
                          <span className="text-emerald-400 font-semibold">Reviewed & Signed by:</span> {capa.approved_by}
                          {capa.human_notes && (
                            <p className="text-slate-400 mt-0.5 italic">"{capa.human_notes}"</p>
                          )}
                        </div>
                        {capa.approved_at && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(capa.approved_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleOpenApproval(capa)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{capa.approved_by ? 'Update Review' : 'QA Sign-Off'}</span>
                    </button>

                    <button
                      onClick={() => dispatch(removeCapaItem(originalIndex))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval Modal */}
      <CapaApprovalModal
        isOpen={Boolean(selectedCapaForApproval)}
        onClose={() => setSelectedCapaForApproval(null)}
        capa={selectedCapaForApproval}
        onApprove={handleApproveAction}
      />
    </div>
  );
};

export default CapaTable;
