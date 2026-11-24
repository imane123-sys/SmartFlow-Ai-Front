import api from './api'

export const serviceService = {
  getAllServices: async (params) => {
    return await api.get('/services', { params })
  },

  getServiceById: async (id) => {
    return await api.get(`/services/${id}`)
  }
}

export default serviceService
