import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const investigationsApi = {
  // System info & samples
  getConfig: () => apiClient.get('/api/config'),
  getHealth: () => apiClient.get('/api/health'),
  getSamples: () => apiClient.get('/api/investigations/samples'),

  // Incident extraction & PDF upload
  extractIncident: (raw_text, input_source = 'pasted_text') =>
    apiClient.post('/api/investigations/extract', { raw_text, input_source }),
  
  uploadPdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/investigations/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // LangGraph full workflow execution
  runWorkflow: (raw_text, input_source = 'pasted_text') =>
    apiClient.post('/api/investigations/run-workflow', { raw_text, input_source }),

  // CRUD investigations
  listInvestigations: (params) => apiClient.get('/api/investigations', { params }),
  getInvestigation: (id) => apiClient.get(`/api/investigations/${id}`),
  createInvestigation: (data) => apiClient.post('/api/investigations', data),
  updateInvestigation: (id, data) => apiClient.put(`/api/investigations/${id}`, data),
  deleteInvestigation: (id) => apiClient.delete(`/api/investigations/${id}`),

  // Human Verification & Sign-off
  verifyInvestigation: (id, data) => apiClient.post(`/api/investigations/${id}/verify`, data),
  
  // CAPA Approval Action
  reviewCapaAction: (investigationId, capaId, data) =>
    apiClient.post(`/api/investigations/${investigationId}/capa/${capaId}/approve`, data),
};
