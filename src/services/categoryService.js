import api from './api'

export const categoryService = {
  getAllCategories: async (params) => {
    return await api.get('/categories', { params })
  },

  getCategoryById: async (id) => {
    return await api.get(`/categories/${id}`)
  }
}

export default categoryService
