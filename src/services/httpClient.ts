import axios from 'axios'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_SSO_API_URL || 'http://localhost:8082',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token if present
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sso_access_token')
    if (token && token !== 'undefined' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Unwrap backend envelope { success: true, message: "...", data: ... }
httpClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data
    }
    return response
  },
  (error) => Promise.reject(error)
)
