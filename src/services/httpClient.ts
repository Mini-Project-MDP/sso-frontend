import axios from 'axios'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_SSO_API_URL || 'https://sso-service.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Bearer token if present
// Priority: sso_access_token (JWT for app APIs) → sso_session_token (for admin panel)
httpClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('sso_access_token')
    const sessionToken = localStorage.getItem('sso_session_token')
    const token = (accessToken && accessToken !== 'undefined') ? accessToken : sessionToken
    if (token && config.headers) {
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
