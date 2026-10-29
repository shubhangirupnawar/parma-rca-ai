import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateRootCause, removeRootCause, addRootCause } from '../../store/investigationSlice';
import RootCauseCard from './RootCauseCard';
import { 
  Users, 
  Cpu, 
  Settings2, 
  Boxes, 
  Scale, 
  ThermometerSnowflake, 
  Plus, 
  ShieldAlert,
  Layers
} from 'lucide-react';

const categoryMeta = {
  Man: {
    icon: Users,
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    description: 'Operator training, shift handover, procedure adherence, fatigue',
  },
  Machine: {
    icon: Cpu,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    description: 'Equipment wear, chiller utility, pump failure, PLC interlocks',
  },
  Method: {
    icon: Settings2,
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    description: 'BMR recipe tolerances, cooling rate, solvent recycling, SOP clarity',
  },
  Material: {
    icon: Boxes,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    description: 'Raw material assay, reagent purity, solvent lot, supplier CoA',
  },
  Measurement: {
    icon: Scale,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    description: 'HPLC calibration, RTD sensor drift, LOD assay accuracy, sampling',
  },
  Environment: {
    icon: ThermometerSnowflake,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    description: 'Cleanroom humidity, HVAC differential pressure, ambient heatwave',
  },
};

export const FishboneDiagram = () => {
  const dispatch = useDispatch();
  const rootCauses = useSelector((state) => state.investigations.draft.rootCauses || state.investigations.draft.root_causes || []);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'];

  const handleUpdate = (index, updatedItem) => {
    dispatch(updateRootCause({ index, updatedItem }));
  };

  const handleDelete = (index) => {
    dispatch(removeRootCause(index));
  };

  const handleAddNewHypothesis = (category) => {
    const newCause = {
      category: category || 'Method',
      hypothesis_title: `New ${category} Hypothesis`,
      description: 'Enter detailed description of failure mode and causal mechanism...',
      why_considered: 'State objective finding or observation...',
      supporting_evidence: [],
      contradictory_evidence: [],
      further_investigation_steps: [],
      confidence_level: 'Moderate Hypothesis',
      is_confirmed_by_human: false,
    };
    dispatch(addRootCause(newCause));
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-white">GxP Scientific Principle:</strong> All AI-generated causes are strictly investigative <em>hypotheses</em>. Every branch of this Ishikawa (6M) analysis must be verified against physical evidence, analytical chromatography, or calibrated sensor data before final closure.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-teal-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All 6M Categories ({rootCauses.length})
        </button>

        {categories.map((cat) => {
          const count = rootCauses.filter((rc) => rc.category?.toLowerCase() === cat.toLowerCase()).length;
          const meta = categoryMeta[cat];
          const Icon = meta.icon;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedCategory === cat
                  ? `${meta.bg} ${meta.color} ${meta.border}`
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-950/60">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6M Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories
          .filter((cat) => selectedCategory === 'ALL' || selectedCategory === cat)
          .map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = meta.icon;
            const causesInCat = rootCauses
              .map((rc, idx) => ({ ...rc, originalIndex: idx }))
              .filter((rc) => rc.category?.toLowerCase() === cat.toLowerCase());

            return (
              <div
                key={cat}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${meta.bg} ${meta.color} border ${meta.border}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm tracking-wide">{cat}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{meta.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddNewHypothesis(cat)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={`Add hypothesis to ${cat}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Causes in this Category */}
                  <div className="space-y-3">
                    {causesInCat.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-950/40 rounded-xl border border-slate-800/40">
                        No active hypotheses under {cat}.
                        <button
                          onClick={() => handleAddNewHypothesis(cat)}
                          className="block mx-auto mt-2 text-teal-400 hover:underline text-[11px]"
                        >
                          + Add hypothesis
                        </button>
                      </div>
                    ) : (
                      causesInCat.map((rc) => (
                        <RootCauseCard
                          key={rc.originalIndex}
                          cause={rc}
                          index={rc.originalIndex}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 text-right">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {causesInCat.length} hypothesis recorded
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default FishboneDiagram;
