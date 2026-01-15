import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3001',
})

// Interceptor to add security mode header
let currentMode = 'vulnerable'

export const setSecurityMode = (mode) => {
  currentMode = mode
}

export const getSecurityMode = () => currentMode

// Add request interceptor to include mode header
api.interceptors.request.use(
  (config) => {
    // Add security mode header to all requests
    config.headers['x-security-mode'] = currentMode
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api

