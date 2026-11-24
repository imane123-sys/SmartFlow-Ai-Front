import api from './api'

export const interventionService = {
  createIntervention: async (data) => {
    return await api.post('/interventions', data)
  },

  getInterventionById: async (id) => {
    return await api.get(`/interventions/${id}`)
  },

  getInterventionsByIncident: async (incidentId) => {
    return await api.get(`/incidents/${incidentId}/interventions`)
  },

  searchInterventions: async (params) => {
    return await api.get('/interventions', { params })
  },

  assignAgent: async (id, data) => {
    return await api.post(`/interventions/${id}/assign`, data)
  },

  startIntervention: async (id) => {
    return await api.post(`/interventions/${id}/start`)
  },

  updateStep: async (id, stepId, data) => {
    return await api.patch(`/interventions/${id}/steps/${stepId}`, data)
  },

  completeIntervention: async (id, data) => {
    return await api.post(`/interventions/${id}/complete`, data)
  },

  cancelIntervention: async (id, data) => {
    return await api.post(`/interventions/${id}/cancel`, data)
  }
}

export default interventionService
