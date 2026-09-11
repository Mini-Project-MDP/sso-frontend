import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Terminal, Play, Key, UserCheck, CheckCircle2 } from 'lucide-react'
import { ssoService } from '../../services/ssoService'
import type { TokenResponse, UserInfoResponse } from '../../types/sso'
import { Button, Card, Tag, Input, Alert } from 'antd'

export const DemoClientPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const codeParam = searchParams.get('code')
  const stateParam = searchParams.get('state')

  const [clientId, setClientId] = useState('app_asset_mgmt_123')
  const [clientSecret, setClientSecret] = useState('secret_asset_mgmt_999')
  const [redirectUri, setRedirectUri] = useState('https://asset-system-frontend.vercel.app/sso/callback')

  const [authCode, setAuthCode] = useState<string | null>(codeParam)
  const [exchanging, setExchanging] = useState(false)
  const [tokenResult, setTokenResult] = useState<TokenResponse | null>(null)

  const [fetchingUser, setFetchingUser] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStartOAuthFlow = () => {
    const state = 'state_' + Math.random().toString(36).substring(7)
    const authorizeUrl = `/sso/login?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email%20roles&state=${state}`
    window.location.href = authorizeUrl
  }

  const handleExchangeToken = async () => {
    if (!authCode) return
    setExchanging(true)
    setErrorMsg(null)
    try {
      const res = await ssoService.exchangeToken({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      })
      setTokenResult(res)
      localStorage.setItem('sso_access_token', res.access_token)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Token exchange failed')
    } finally {
      setExchanging(false)
    }
  }

  const handleFetchUserInfo = async () => {
    setFetchingUser(true)
    setErrorMsg(null)
    try {
      const info = await ssoService.getUserInfo()
      setUserInfo(info)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to fetch userinfo')
    } finally {
      setFetchingUser(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Terminal className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">OAuth2 / OIDC Client Testing Playground</h1>
            <Tag color="red" className="font-bold">Interactive Prototype</Tag>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
            Simulate how external applications (e.g. Asset Management System) redirect users to Mayora SSO, receive authorization codes, exchange them for JWT tokens, and fetch mapped user identities.
          </p>
        </div>

        <Button
          type="primary"
          danger
          icon={<Play className="w-4 h-4" />}
          onClick={handleStartOAuthFlow}
          className="h-11 px-6 bg-gradient-to-r from-red-600 to-rose-600 border-none font-bold rounded-xl shadow-md shadow-red-500/20"
        >
          1. Initiate SSO Login Redirect
        </Button>
      </div>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMsg(null)}
          className="rounded-xl border-red-200 bg-red-50 text-red-800 font-medium text-xs"
        />
      )}

      {/* Grid Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Config */}
        <Card title="Step 1: OAuth2 Parameters" className="bg-white border-slate-200 shadow-xs rounded-2xl">
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Client ID</label>
              <Input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="!bg-slate-50 !border-slate-300 font-mono text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Client Secret</label>
              <Input.Password
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="!bg-slate-50 !border-slate-300 font-mono text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Redirect URI</label>
              <Input
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="!bg-slate-50 !border-slate-300 font-mono text-xs text-slate-800"
              />
            </div>
          </div>
        </Card>

        {/* Step 2: Auth Code & Token Exchange */}
        <Card title="Step 2: Token Exchange" className="bg-white border-slate-200 shadow-xs rounded-2xl">
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Authorization Code Received:</label>
              <Input
                value={authCode || ''}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Click Initiate SSO Login to get code"
                className="!bg-amber-50 !border-amber-300 !text-amber-900 font-mono text-xs font-semibold"
              />
            </div>

            <Button
              type="primary"
              icon={<Key className="w-3.5 h-3.5" />}
              loading={exchanging}
              disabled={!authCode}
              onClick={handleExchangeToken}
              block
              className="bg-amber-600 hover:bg-amber-500 font-bold h-9 rounded-xl text-white"
            >
              Exchange Code for JWT
            </Button>

            {tokenResult && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <div className="text-emerald-700 font-bold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Access Token Issued
                </div>
                <div className="text-slate-600 truncate">{tokenResult.access_token}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 3: Userinfo Endpoint */}
        <Card title="Step 3: Fetch Mapped User" className="bg-white border-slate-200 shadow-xs rounded-2xl">
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 font-medium">
              Call <code className="text-red-600 font-bold">GET /api/v1/sso/userinfo</code> with Bearer access token to retrieve user identity and target application mapping.
            </p>

            <Button
              type="primary"
              danger
              icon={<UserCheck className="w-3.5 h-3.5" />}
              loading={fetchingUser}
              disabled={!tokenResult}
              onClick={handleFetchUserInfo}
              block
              className="bg-red-600 hover:bg-red-700 font-bold h-9 rounded-xl"
            >
              Fetch User Info & App Mapping
            </Button>

            {userInfo && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                <div className="font-extrabold text-slate-900 text-xs">{userInfo.name}</div>
                <div className="text-slate-600 font-medium">{userInfo.email} | {userInfo.employee_no}</div>
                {userInfo.app_mapping && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-red-700 font-mono">
                    <div>App Role: <b>{userInfo.app_mapping.app_role}</b></div>
                    <div>Permissions: {JSON.stringify(userInfo.app_mapping.permissions)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Raw Payload Inspection */}
      {(tokenResult || userInfo) && (
        <Card title="Payload Inspector" className="bg-white border-slate-200 shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokenResult && (
              <div>
                <h4 className="text-xs font-bold text-slate-600 mb-2">Token Response Payload</h4>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(tokenResult, null, 2)}
                </pre>
              </div>
            )}
            {userInfo && (
              <div>
                <h4 className="text-xs font-bold text-slate-600 mb-2">Userinfo & App Mapping Payload</h4>
                <pre className="p-3 rounded-xl bg-slate-900 text-rose-300 text-xs font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
