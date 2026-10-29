import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Cpu, Info, CheckCircle2, ChevronDown, ChevronUp, KeyRound, Sparkles } from 'lucide-react';

export const SystemStatusBanner = () => {
  const systemConfig = useSelector((state) => state.ui.systemConfig);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const isLive = systemConfig.groq_configured;

  return (
    <div className={`rounded-2xl border p-5 mb-6 transition-all ${
      isLive
        ? 'bg-slate-900/60 border-teal-500/30'
        : 'bg-gradient-to-r from-slate-900 to-amber-950/20 border-amber-500/30'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl ${
            isLive ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {isLive ? <Sparkles className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-base">
                {isLive ? 'Groq AI Engine Active' : 'Pharmaceutical Simulation / Demo Mode Active'}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                isLive
                  ? 'bg-teal-950 text-teal-300 border-teal-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {systemConfig.groq_model || 'llama-3.3-70b-versatile'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {isLive
                ? 'Direct integration with Groq LLM API. Real-time extraction, 5 Whys, 6M Fishbone, and CAPA synthesis.'
                : 'Zero-setup offline mode active with pre-loaded pharmaceutical API deviation scenarios (Paracetamol, Atorvastatin).'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfigGuide(!showConfigGuide)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 transition-colors shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-teal-400" />
          <span>{isLive ? 'Model Config' : 'Enable Live Groq Key'}</span>
          {showConfigGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showConfigGuide && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2 animate-fade-in font-mono bg-slate-950/70 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 font-sans pb-1 font-semibold">
            <span>To configure Live Groq API:</span>
            <span className="text-[11px] text-teal-400">backend/.env</span>
          </div>
          <p className="text-slate-400 font-sans">
            1. Obtain an API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-teal-400 underline">console.groq.com</a>.
          </p>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-teal-300">
            GROQ_API_KEY=gsk_your_actual_key_here<br />
            GROQ_MODEL=llama-3.3-70b-versatile
          </div>
          <p className="text-slate-400 font-sans">
            Supported models: <code className="text-amber-300">llama-3.3-70b-versatile</code>, <code className="text-amber-300">gemma2-9b-it</code>, <code className="text-amber-300">llama-3.1-8b-instant</code>, <code className="text-amber-300">mixtral-8x7b-32768</code>.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemStatusBanner;
