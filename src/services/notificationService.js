import api from './api'

export const notificationService = {
  getUserNotifications: async (params) => {
    return await api.get('/notifications', { params })
  },

  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count')
  },

  getNotificationSummary: async () => {
    return await api.get('/notifications/summary')
  },

  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`)
  },

  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all')
  },

  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`)
  },

  createManualNotification: async (data) => {
    return await api.post('/notifications', data)
  }
}

export default notificationService
