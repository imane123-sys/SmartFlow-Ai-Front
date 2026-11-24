import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    let message = 'Une erreur inattendue est survenue'

    if (!error.response) {
      message = 'Impossible de communiquer avec le serveur. Vérifiez que le backend est actif.'
    } else if (status === 401) {
      message = error.response.data?.message || 'Email ou mot de passe incorrect'
    } else if (status === 403) {
      message = error.response.data?.message || 'Vous n’avez pas les droits nécessaires pour accéder à cette ressource'
    } else if (error.response.data?.message) {
      message = error.response.data.message
    } else if (error.response.data?.error) {
      message = error.response.data.error
    }

    const customError = new Error(message)
    customError.status = status
    return Promise.reject(customError)
  }
)

export default api
