import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { runFullWorkflowThunk, fetchSamplesThunk, updateDraftField } from '../../store/investigationSlice';
import { setActivePage, setToast } from '../../store/uiSlice';
import { investigationsApi } from '../../api/client';
import { 
  FileUp, 
  FileText, 
  Mail, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Beaker, 
  FlaskConical,
  BookOpen
} from 'lucide-react';

export const IncidentInputForm = () => {
  const dispatch = useDispatch();
  const samples = useSelector((state) => state.investigations.samples);
  const loading = useSelector((state) => state.investigations.loading);
  const isAiProcessing = useSelector((state) => state.ui.isAiProcessing);
  const aiProcessingStep = useSelector((state) => state.ui.aiProcessingStep);

  const [inputTab, setInputTab] = useState('pasted_text'); // 'pasted_text', 'pdf', 'email'
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [ocrWarning, setOcrWarning] = useState(null);

  useEffect(() => {
    dispatch(fetchSamplesThunk());
  }, [dispatch]);

  const handleSampleLoad = (sample) => {
    setRawText(sample.text);
    setInputTab('pasted_text');
    setOcrWarning(null);
    dispatch(setToast({ type: 'info', message: `Loaded pharmaceutical scenario: ${sample.title}` }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      dispatch(setToast({ type: 'error', message: 'Only PDF documents are supported.' }));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      dispatch(setToast({ type: 'error', message: 'File exceeds 15MB limit.' }));
      return;
    }

    setSelectedFile(file);
    setPdfUploading(true);
    setOcrWarning(null);

    try {
      const response = await investigationsApi.uploadPdf(file);
      const data = response.data;
      if (data.ocr_required) {
        setOcrWarning(data.message);
      } else {
        setRawText(data.extracted_text);
        dispatch(setToast({ type: 'success', message: `Extracted ${data.char_count} characters from PDF.` }));
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to parse PDF document.';
      dispatch(setToast({ type: 'error', message: msg }));
    } finally {
      setPdfUploading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!rawText.trim()) {
      dispatch(setToast({ type: 'error', message: 'Please enter or upload incident information before triggering AI analysis.' }));
      return;
    }

    dispatch(updateDraftField({ field: 'raw_input_text', value: rawText }));
    dispatch(updateDraftField({ field: 'input_source', value: inputTab }));

    const result = await dispatch(runFullWorkflowThunk({
      raw_text: rawText,
      input_source: inputTab,
    }));

    if (runFullWorkflowThunk.fulfilled.match(result)) {
      // Navigate to RCA Analysis view
      dispatch(setActivePage('rca-analysis'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Presets Pill Bar */}
      {samples.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Load Quick Pharmaceutical API Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample.key}
                onClick={() => handleSampleLoad(sample)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all hover:scale-[1.02] flex items-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate max-w-[220px]">{sample.title.split('-')[0]}</span>
                <span className="font-mono text-[10px] text-teal-300">({sample.batch})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Source Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
          <button
            onClick={() => setInputTab('pasted_text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputTab === 'pasted_text'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pasted Text</span>
          </button>

          <button
            onClick={() => setInputTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputTab === 'pdf'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>PDF Document Upload</span>
          </button>

          <button
            onClick={() => setInputTab('email')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputTab === 'email'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Alert / Notification</span>
          </button>
        </div>

        {/* Input Bodies */}
        {inputTab === 'pdf' ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-2xl p-8 text-center transition-all bg-slate-950/40">
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                  {pdfUploading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop a PDF file'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Batch Manufacturing Records (BMR), Quality Deviation Reports, Analytical Certificates (up to 15MB)
                </p>
              </label>
            </div>

            {ocrWarning && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-300 mb-0.5">Scanned Document Detected</div>
                  <div>{ocrWarning}</div>
                </div>
              </div>
            )}

            {rawText && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Extracted PDF Text Preview:
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={8}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {inputTab === 'email' ? 'Paste Quality Email Notification Content:' : 'Paste Deviation / Incident Description:'}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{rawText.length} characters</span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                inputTab === 'email'
                  ? "From: qa-deviation@pharmaco.com\nSubject: URGENT: OOS Alert - Paracetamol Batch PARA-2026-089A\nDate: 2026-03-14\n\nDear QA Team,\nDuring release testing of Batch PARA-2026-089A, Related Substance Impurity B was detected at 0.18%..."
                  : "Enter raw incident details: e.g. Batch number, API product name, manufacturing equipment, observed OOS result, temperature spikes, or shift notes..."
              }
              rows={12}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono leading-relaxed resize-y"
            />
          </div>
        )}

        {/* AI Action CTA Panel */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <strong className="text-slate-300">Automated Pipeline:</strong> LangGraph extracts structured fields, validates GxP bounds, builds 6M Fishbone hypotheses & 5 Whys, and drafts CAPA recommendations.
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAiProcessing || !rawText.trim()}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs tracking-wide shadow-xl transition-all ${
              isAiProcessing || !rawText.trim()
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 hover:scale-[1.02] shadow-teal-500/20 active:scale-[0.98]'
            }`}
          >
            {isAiProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{aiProcessingStep || 'Synthesizing RCA...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Root Cause Analysis (LangGraph)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentInputForm;
