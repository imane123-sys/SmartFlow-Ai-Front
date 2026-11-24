import api from './api'

export const charterService = {
  generateCharterDraft: async (incidentId) => {
    return await api.post(`/incidents/${incidentId}/charter-draft`)
  },

  createManualCharter: async (incidentId, data) => {
    return await api.post(`/incidents/${incidentId}/charters`, data)
  },

  getCharterById: async (id) => {
    return await api.get(`/charters/${id}`)
  },

  getChartersByIncident: async (incidentId) => {
    return await api.get(`/incidents/${incidentId}/charters`)
  },

  updateCharter: async (id, data) => {
    return await api.put(`/charters/${id}`, data)
  },

  submitCharter: async (id) => {
    return await api.post(`/charters/${id}/submit`)
  },

  validateCharter: async (id) => {
    return await api.post(`/charters/${id}/validate`)
  },

  rejectCharter: async (id, data) => {
    return await api.post(`/charters/${id}/reject`, data)
  }
}

export default charterService
