import { httpClient } from './httpClient'
import type {
  ClientApp,
  SSOUser,
  UserAppMapping,
  SSOSession,
  AuditLog,
  StatsResponse,
  AuthorizeInfo,
  LoginResponse,
  TokenResponse,
  UserInfoResponse,
} from '../types/sso'

export const ssoService = {
  // --- SSO Public & OAuth2 Endpoints ---
  getAuthorizeInfo: async (params: {
    client_id: string
    redirect_uri?: string
    response_type?: string
    scope?: string
    state?: string
  }): Promise<AuthorizeInfo> => {
    const res = await httpClient.get<AuthorizeInfo>('/api/v1/sso/authorize', { params })
    return res.data
  },

  login: async (payload: {
    username_or_email: string
    password: string
    client_id?: string
    redirect_uri?: string
    state?: string
    scope?: string
  }): Promise<LoginResponse> => {
    const res = await httpClient.post<LoginResponse>('/api/v1/sso/login', payload)
    return res.data
  },

  exchangeToken: async (payload: {
    grant_type: string
    code: string
    redirect_uri: string
    client_id: string
    client_secret: string
  }): Promise<TokenResponse> => {
    const res = await httpClient.post<TokenResponse>('/api/v1/sso/token', payload)
    return res.data
  },

  getUserInfo: async (): Promise<UserInfoResponse> => {
    const res = await httpClient.get<UserInfoResponse>('/api/v1/sso/userinfo')
    return res.data
  },

  logout: async (sessionToken?: string): Promise<void> => {
    await httpClient.post('/api/v1/sso/logout', null, { params: { session_token: sessionToken } })
  },

  // --- Admin Dashboard Endpoints ---
  getStats: async (): Promise<StatsResponse> => {
    const res = await httpClient.get<StatsResponse>('/api/v1/admin/stats')
    return res.data
  },

  // Connected Applications
  getApps: async (): Promise<ClientApp[]> => {
    const res = await httpClient.get<ClientApp[]>('/api/v1/admin/apps')
    return res.data
  },

  createApp: async (payload: {
    name: string
    redirect_uris: string
    logo_url?: string
    description?: string
    allowed_scopes?: string
  }): Promise<ClientApp> => {
    const res = await httpClient.post<ClientApp>('/api/v1/admin/apps', payload)
    return res.data
  },

  rotateSecret: async (id: string): Promise<ClientApp> => {
    const res = await httpClient.post<ClientApp>(`/api/v1/admin/apps/${id}/rotate-secret`)
    return res.data
  },

  toggleAppStatus: async (id: string, isActive: boolean): Promise<void> => {
    await httpClient.put(`/api/v1/admin/apps/${id}/status`, { is_active: isActive })
  },

  deleteApp: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/apps/${id}`)
  },

  // SSO Users
  getUsers: async (): Promise<SSOUser[]> => {
    const res = await httpClient.get<SSOUser[]>('/api/v1/admin/users')
    return res.data
  },

  createUser: async (payload: {
    employee_no: string
    name: string
    email: string
    password: string
    department?: string
    position?: string
    is_master?: boolean
  }): Promise<SSOUser> => {
    const res = await httpClient.post<SSOUser>('/api/v1/admin/users', payload)
    return res.data
  },

  updateUserStatus: async (id: string, status: string): Promise<void> => {
    await httpClient.put(`/api/v1/admin/users/${id}/status`, { status })
  },

  toggleMasterUser: async (id: string, isMaster: boolean): Promise<void> => {
    await httpClient.put(`/api/v1/admin/users/${id}/master`, { is_master: isMaster })
  },

  // User App Mappings
  getMappings: async (): Promise<UserAppMapping[]> => {
    const res = await httpClient.get<UserAppMapping[]>('/api/v1/admin/user-mappings')
    return res.data
  },

  createMapping: async (payload: {
    user_id: string
    app_id: string
    external_user_id: string
    app_role: string
    permissions: string[]
  }): Promise<UserAppMapping> => {
    const res = await httpClient.post<UserAppMapping>('/api/v1/admin/user-mappings', payload)
    return res.data
  },

  deleteMapping: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/user-mappings/${id}`)
  },

  // Active Sessions
  getSessions: async (): Promise<SSOSession[]> => {
    const res = await httpClient.get<SSOSession[]>('/api/v1/admin/sessions')
    return res.data
  },

  revokeSession: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/v1/admin/sessions/${id}`)
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await httpClient.get<AuditLog[]>('/api/v1/admin/audit-logs')
    return res.data
  },
}
