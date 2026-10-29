import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePage, setSystemConfig } from '../../store/uiSlice';
import { resetDraft } from '../../store/investigationSlice';
import { investigationsApi } from '../../api/client';
import { 
  PlusCircle, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FileCheck2,
  HelpCircle
} from 'lucide-react';

export const Header = () => {
  const dispatch = useDispatch();
  const systemConfig = useSelector((state) => state.ui.systemConfig);
  const isAiProcessing = useSelector((state) => state.ui.isAiProcessing);
  const aiProcessingStep = useSelector((state) => state.ui.aiProcessingStep);

  useEffect(() => {
    investigationsApi.getConfig()
      .then((res) => {
        dispatch(setSystemConfig(res.data));
      })
      .catch((err) => {
        console.warn('Could not reach config endpoint, backend may be offline:', err);
      });
  }, [dispatch]);

  const handleStartNew = () => {
    dispatch(resetDraft());
    dispatch(setActivePage('new-investigation'));
  };

  const isLiveGroq = systemConfig.groq_configured;

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: AI & Model Status */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          isLiveGroq
            ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        }`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>Engine: <strong className="font-mono">{systemConfig.groq_model || 'llama-3.3-70b-versatile'}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          <span>{isLiveGroq ? 'Live Groq API' : 'Pharma Demo Simulation'}</span>
        </div>

        {/* Global AI Progress Indicator */}
        {isAiProcessing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>{aiProcessingStep || 'LangGraph Processing...'}</span>
          </div>
        )}
      </div>

      {/* Right: GxP Safety Notice & Primary Action */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <FileCheck2 className="w-4 h-4 text-teal-400" />
          <span>AI outputs require qualified human verification</span>
        </div>

        <button
          onClick={handleStartNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl text-xs tracking-wide shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
