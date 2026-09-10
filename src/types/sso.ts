export interface ClientApp {
  id: string
  name: string
  client_id: string
  client_secret: string
  redirect_uris: string
  logo_url: string
  description: string
  allowed_scopes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SSOUser {
  id: string
  employee_no: string
  name: string
  email: string
  department: string
  position: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  is_master: boolean
  created_at: string
  updated_at: string
}

export interface UserAppMapping {
  id: string
  user_id: string
  app_id: string
  external_user_id: string
  app_role: string
  permissions: string // JSON string array
  is_active: boolean
  created_at: string
  updated_at: string
  user?: SSOUser
  app?: ClientApp
}

export interface SSOSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string
  user_agent: string
  expires_at: string
  created_at: string
  user?: SSOUser
}

export interface AuditLog {
  id: string
  user_id?: string
  app_id?: string
  event_type: string
  ip_address: string
  user_agent: string
  details: string // JSON string
  created_at: string
  user?: SSOUser
  app?: ClientApp
}

export interface StatsResponse {
  total_apps: number
  total_users: number
  active_sessions: number
  logins_today: number
}

export interface AuthorizeInfo {
  client_id: string
  app_name: string
  logo_url: string
  description: string
  redirect_uri: string
  response_type: string
  scope: string
  state: string
}

export interface LoginResponse {
  session_token: string
  auth_code?: string
  redirect_uri?: string
  user: SSOUser
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  id_token?: string
  scope?: string
}

export interface UserInfoResponse {
  sub: string
  employee_no: string
  name: string
  email: string
  department: string
  position: string
  is_master: boolean
  app_mapping?: {
    app_id: string
    app_name: string
    external_user_id: string
    app_role: string
    permissions: string[]
  }
}
