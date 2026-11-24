import api from './api'

export const aiAnalysisService = {
  analyzeIncident: async (incidentId) => {
    return await api.post(`/incidents/${incidentId}/analyze`)
  },

  getAnalysesByIncident: async (incidentId) => {
    return await api.get(`/incidents/${incidentId}/analyses`)
  },

  getAnalysisById: async (id) => {
    return await api.get(`/analyses/${id}`)
  }
}

export default aiAnalysisService
