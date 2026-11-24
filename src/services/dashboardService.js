import api from './api'

export const dashboardService = {
  getSummary: async (params) => {
    return await api.get('/dashboard/summary', { params })
  },

  getIncidentsByStatus: async (params) => {
    return await api.get('/dashboard/incidents-by-status', { params })
  },

  getIncidentsByPriority: async (params) => {
    return await api.get('/dashboard/incidents-by-priority', { params })
  },

  getIncidentsByCategory: async (params) => {
    return await api.get('/dashboard/incidents-by-category', { params })
  },

  getIncidentsByService: async (params) => {
    return await api.get('/dashboard/incidents-by-service', { params })
  },

  getInterventionMetrics: async (params) => {
    return await api.get('/dashboard/interventions', { params })
  }
}

export default dashboardService
