import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import IncidentInputForm from '../components/investigation/IncidentInputForm';
import ExtractedFormReview from '../components/investigation/ExtractedFormReview';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const NewInvestigationPage = () => {
  const draft = useSelector((state) => state.investigations.draft);
  const [activeStep, setActiveStep] = useState(draft.title && draft.title !== 'Untitled Investigation' ? 'review' : 'input');

  const hasExtractedData = Boolean(draft.title && draft.title !== 'Untitled Investigation');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">New Quality Incident Investigation</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit manufacturing deviation report or upload document for automated AI Root Cause Analysis
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveStep('input')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeStep === 'input'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px]">1</span>
          <span>Incident Data Input (PDF / Text)</span>
        </button>

        <button
          onClick={() => setActiveStep('review')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeStep === 'review'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px]">2</span>
          <span>Review Extracted Specification</span>
          {hasExtractedData && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 ml-1" />}
        </button>
      </div>

      {/* Step Content */}
      {activeStep === 'input' ? (
        <IncidentInputForm />
      ) : (
        <ExtractedFormReview />
      )}
    </div>
  );
};

export default NewInvestigationPage;
