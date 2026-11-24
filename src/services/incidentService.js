import api from './api'

export const incidentService = {
  createIncident: async (data) => {
    return await api.post('/incidents', data)
  },

  searchIncidents: async (params) => {
    return await api.get('/incidents', { params })
  },

  getIncidentById: async (id) => {
    return await api.get(`/incidents/${id}`)
  },

  getIncidentByReference: async (reference) => {
    return await api.get(`/incidents/reference/${reference}`)
  },

  updateIncident: async (id, data) => {
    return await api.put(`/incidents/${id}`, data)
  },

  updateStatus: async (id, data) => {
    return await api.patch(`/incidents/${id}/status`, data)
  },

  assignIncident: async (id, data) => {
    return await api.patch(`/incidents/${id}/assign`, data)
  },

  getIncidentHistory: async (id) => {
    return await api.get(`/incidents/${id}/history`)
  }
}

export default incidentService
