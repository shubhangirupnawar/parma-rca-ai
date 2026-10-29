import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activePage: 'dashboard', // 'dashboard', 'new-investigation', 'rca-analysis', 'investigation-details', 'capa-recommendations'
  sidebarCollapsed: false,
  systemConfig: {
    groq_configured: false,
    groq_model: 'llama-3.3-70b-versatile',
    mode: 'Checking...',
    supported_models: []
  },
  toast: null, // { type: 'success' | 'error' | 'info', message: '' }
  isAiProcessing: false,
  aiProcessingStep: '', // e.g. 'Extracting Incident Information...', 'Synthesizing 6M Fishbone & 5 Whys...'
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSystemConfig: (state, action) => {
      state.systemConfig = action.payload;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
    setAiProcessing: (state, action) => {
      state.isAiProcessing = action.payload.isProcessing;
      state.aiProcessingStep = action.payload.step || '';
    },
  },
});

export const {
  setActivePage,
  toggleSidebar,
  setSystemConfig,
  setToast,
  clearToast,
  setAiProcessing,
} = uiSlice.actions;

export default uiSlice.reducer;
