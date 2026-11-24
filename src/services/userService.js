import api from './api'

export const userService = {
  getAllUsers: async (params) => {
    return await api.get('/users', { params })
  },

  getUserById: async (id) => {
    return await api.get(`/users/${id}`)
  },

  createUser: async (data) => {
    return await api.post('/users', data)
  },

  updateUser: async (id, data) => {
    return await api.put(`/users/${id}`, data)
  },

  toggleUserStatus: async (id) => {
    return await api.patch(`/users/${id}/status`)
  },

  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`)
  }
}

export default userService
