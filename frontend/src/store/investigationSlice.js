import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { investigationsApi } from '../api/client';
import { setToast, setAiProcessing, setActivePage } from './uiSlice';

// Async Thunks
export const fetchInvestigations = createAsyncThunk(
  'investigations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await investigationsApi.listInvestigations(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch investigations');
    }
  }
);

export const fetchInvestigationById = createAsyncThunk(
  'investigations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await investigationsApi.getInvestigation(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch investigation');
    }
  }
);

export const runFullWorkflowThunk = createAsyncThunk(
  'investigations/runWorkflow',
  async ({ raw_text, input_source }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAiProcessing({ isProcessing: true, step: 'Initiating LangGraph AI Quality Pipeline...' }));
      
      // Simulate stepped feedback for high responsiveness
      setTimeout(() => {
        dispatch(setAiProcessing({ isProcessing: true, step: 'Extracting Incident Parameters & Verifying GxP Data...' }));
      }, 700);

      setTimeout(() => {
        dispatch(setAiProcessing({ isProcessing: true, step: 'Generating 5 Whys & 6M Fishbone Hypotheses...' }));
      }, 1500);

      setTimeout(() => {
        dispatch(setAiProcessing({ isProcessing: true, step: 'Formulating CAPA Recommendations & Effectiveness Plans...' }));
      }, 2300);

      const response = await investigationsApi.runWorkflow(raw_text, input_source);
      
      dispatch(setAiProcessing({ isProcessing: false, step: '' }));
      dispatch(setToast({ type: 'success', message: 'AI Root Cause & CAPA analysis successfully generated!' }));
      return { data: response.data, raw_text, input_source };
    } catch (err) {
      dispatch(setAiProcessing({ isProcessing: false, step: '' }));
      const msg = err.response?.data?.detail || 'AI Workflow execution failed';
      dispatch(setToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const saveInvestigationThunk = createAsyncThunk(
  'investigations/save',
  async (investigationData, { dispatch, rejectWithValue }) => {
    try {
      let response;
      if (investigationData.id) {
        response = await investigationsApi.updateInvestigation(investigationData.id, investigationData);
        dispatch(setToast({ type: 'success', message: 'Investigation successfully updated and saved.' }));
      } else {
        response = await investigationsApi.createInvestigation(investigationData);
        dispatch(setToast({ type: 'success', message: 'New RCA Investigation successfully recorded.' }));
      }
      dispatch(fetchInvestigations());
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save investigation';
      dispatch(setToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const verifyInvestigationThunk = createAsyncThunk(
  'investigations/verify',
  async ({ id, reviewer_name, review_notes }, { dispatch, rejectWithValue }) => {
    try {
      const response = await investigationsApi.verifyInvestigation(id, {
        reviewer_name,
        review_notes,
        mark_as_verified: true,
      });
      dispatch(setToast({ type: 'success', message: 'Investigation formally verified and signed by QA Professional.' }));
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to verify investigation';
      dispatch(setToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const reviewCapaActionThunk = createAsyncThunk(
  'investigations/reviewCapa',
  async ({ investigationId, capaId, action, reviewer_name, notes }, { dispatch, rejectWithValue }) => {
    try {
      await investigationsApi.reviewCapaAction(investigationId, capaId, {
        action,
        reviewer_name,
        notes,
      });
      dispatch(setToast({ type: 'success', message: `CAPA Action marked as ${action}.` }));
      dispatch(fetchInvestigationById(investigationId));
      return { capaId, action, reviewer_name, notes };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update CAPA status';
      dispatch(setToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const fetchSamplesThunk = createAsyncThunk(
  'investigations/fetchSamples',
  async (_, { rejectWithValue }) => {
    try {
      const response = await investigationsApi.getSamples();
      return response.data.samples;
    } catch (err) {
      return rejectWithValue('Failed to load incident samples');
    }
  }
);

const initialState = {
  investigations: [],
  currentInvestigation: null,
  activeTab: 'extracted', // 'extracted', 'fishbone', 'five-whys', 'evidence', 'capa'
  loading: false,
  error: null,
  samples: [],
  // Form draft state when creating/editing
  draft: {
    title: '',
    description: '',
    batch_number: 'Not provided',
    product_name: 'Not provided',
    department: 'Not provided',
    incident_date: 'Not provided',
    observed_issue: 'Not provided',
    input_source: 'pasted_text',
    raw_input_text: '',
    is_demo_mode: false,
    ai_model_used: 'llama-3.3-70b-versatile',
    five_whys_data: [],
    root_causes: [],
    evidence_items: [],
    capa_recommendations: [],
  },
};

export const investigationSlice = createSlice({
  name: 'investigations',
  initialState,
  reducers: {
    setCurrentInvestigation: (state, action) => {
      state.currentInvestigation = action.payload;
      if (action.payload) {
        state.draft = { ...action.payload };
      }
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateDraftField: (state, action) => {
      const { field, value } = action.payload;
      state.draft[field] = value;
    },
    updateRootCause: (state, action) => {
      const { index, updatedItem } = action.payload;
      state.draft.root_causes[index] = updatedItem;
    },
    addRootCause: (state, action) => {
      state.draft.root_causes.push(action.payload);
    },
    removeRootCause: (state, action) => {
      state.draft.root_causes.splice(action.payload, 1);
    },
    toggleEvidenceCollected: (state, action) => {
      const index = action.payload;
      if (state.draft.evidence_items[index]) {
        state.draft.evidence_items[index].is_collected = !state.draft.evidence_items[index].is_collected;
      }
    },
    addEvidenceItem: (state, action) => {
      state.draft.evidence_items.push(action.payload);
    },
    removeEvidenceItem: (state, action) => {
      state.draft.evidence_items.splice(action.payload, 1);
    },
    updateCapaItem: (state, action) => {
      const { index, updatedItem } = action.payload;
      state.draft.capa_recommendations[index] = updatedItem;
    },
    addCapaItem: (state, action) => {
      state.draft.capa_recommendations.push(action.payload);
    },
    removeCapaItem: (state, action) => {
      state.draft.capa_recommendations.splice(action.payload, 1);
    },
    resetDraft: (state) => {
      state.draft = { ...initialState.draft };
      state.currentInvestigation = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder.addCase(fetchInvestigations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInvestigations.fulfilled, (state, action) => {
      state.loading = false;
      state.investigations = action.payload;
    });
    builder.addCase(fetchInvestigations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Detail
    builder.addCase(fetchInvestigationById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInvestigationById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentInvestigation = action.payload;
      state.draft = { ...action.payload };
    });
    builder.addCase(fetchInvestigationById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Workflow
    builder.addCase(runFullWorkflowThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(runFullWorkflowThunk.fulfilled, (state, action) => {
      state.loading = false;
      const { data, raw_text, input_source } = action.payload;
      const inc = data.incident_data || {};
      
      state.draft = {
        title: inc.incident_title || 'Quality Incident Investigation',
        description: inc.incident_description || 'Not provided',
        batch_number: inc.batch_number || 'Not provided',
        product_name: inc.product_name || 'Not provided',
        department: inc.department || 'Not provided',
        incident_date: inc.incident_date || 'Not provided',
        observed_issue: inc.observed_issue || 'Not provided',
        input_source: input_source || 'pasted_text',
        raw_input_text: raw_text || '',
        is_demo_mode: data.is_demo_mode || false,
        ai_model_used: inc.ai_model_used || 'llama-3.3-70b-versatile',
        five_whys_data: data.five_whys || [],
        root_causes: data.root_causes || [],
        evidence_items: data.evidence_items || [],
        capa_recommendations: data.capa_recommendations || [],
        status: 'RCA_COMPLETED',
      };
    });
    builder.addCase(runFullWorkflowThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Save
    builder.addCase(saveInvestigationThunk.fulfilled, (state, action) => {
      state.currentInvestigation = action.payload;
      state.draft = { ...action.payload };
    });

    // Verify
    builder.addCase(verifyInvestigationThunk.fulfilled, (state, action) => {
      state.currentInvestigation = action.payload;
      state.draft = { ...action.payload };
    });

    // Samples
    builder.addCase(fetchSamplesThunk.fulfilled, (state, action) => {
      state.samples = action.payload;
    });
  },
});

export const {
  setCurrentInvestigation,
  setActiveTab,
  updateDraftField,
  updateRootCause,
  addRootCause,
  removeRootCause,
  toggleEvidenceCollected,
  addEvidenceItem,
  removeEvidenceItem,
  updateCapaItem,
  addCapaItem,
  removeCapaItem,
  resetDraft,
} = investigationSlice.actions;

export default investigationSlice.reducer;
