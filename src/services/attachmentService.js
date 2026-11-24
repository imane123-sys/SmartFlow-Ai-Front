import api from './api'

export const attachmentService = {
  uploadAttachment: async (incidentId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return await api.post(`/incidents/${incidentId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getAttachmentsByIncident: async (incidentId) => {
    return await api.get(`/incidents/${incidentId}/attachments`)
  },

  downloadAttachment: async (id, fileName) => {
    const blob = await api.get(`/attachments/${id}/download`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName || `piece-jointe-${id}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  deleteAttachment: async (id) => {
    return await api.delete(`/attachments/${id}`)
  }
}

export default attachmentService
