import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { ShieldCheck, ArrowRight, Lock, Mail, Building2 } from 'lucide-react'
import { ssoService } from '../../services/ssoService'
import { useAuth } from '../../context/AuthContext'
import type { AuthorizeInfo } from '../../types/sso'
import { Alert, Button, Form, Input, Card, Tag } from 'antd'

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const client_id = searchParams.get('client_id')
  const redirect_uri = searchParams.get('redirect_uri')
  const state = searchParams.get('state')
  const scope = searchParams.get('scope')

  const [loading, setLoading] = useState(false)
  const [appInfoLoading, setAppInfoLoading] = useState(false)
  const [appInfo, setAppInfo] = useState<AuthorizeInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (client_id) {
      setAppInfoLoading(true)
      ssoService
        .getAuthorizeInfo({ client_id, redirect_uri: redirect_uri || undefined, state: state || undefined, scope: scope || undefined })
        .then((info) => setAppInfo(info))
        .catch((err) => setErrorMsg(err.response?.data?.error || 'Invalid or unregistered client application'))
        .finally(() => setAppInfoLoading(false))
    }
  }, [client_id, redirect_uri, state, scope])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const resp = await ssoService.login({
        username_or_email: values.username_or_email,
        password: values.password,
        client_id: client_id || undefined,
        redirect_uri: redirect_uri || undefined,
        state: state || undefined,
        scope: scope || undefined,
      })

      login(resp.user, resp.session_token)

      if (resp.redirect_uri) {
        window.location.href = resp.redirect_uri
      } else {
        navigate('/admin')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickAccount = (email: string) => {
    form.setFieldsValue({
      username_or_email: email,
      password: 'Password123!',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-100 via-slate-50 to-slate-100 p-4 relative overflow-hidden">
      {/* Background Decorator Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden text-slate-800">
        <div className="p-2 sm:p-4 text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mayora SSO Portal</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Single Sign-On Corporate Identity Provider</p>

          {/* Client Application Context Banner */}
          {client_id && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-left flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-700 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="text-slate-500 font-medium">Authenticating for application:</div>
                <div className="font-extrabold text-red-700 text-sm">{appInfo?.app_name || 'Client Application'}</div>
                {appInfo?.description && <div className="text-slate-600 text-[11px] mt-0.5">{appInfo.description}</div>}
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            className="mb-4 rounded-xl border-red-300 bg-red-50 text-red-800 font-medium text-xs"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ username_or_email: 'master1@mayora.com', password: 'Password123!' }}
          size="large"
          className="mt-2"
        >
          <Form.Item
            name="username_or_email"
            rules={[{ required: true, message: 'Please input email or employee number' }]}
          >
            <Input
              prefix={<Mail className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="Email or Employee No."
              className="!bg-slate-50 !border-slate-300 !text-slate-900 hover:!border-red-500 focus:!border-red-500 !rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input password' }]}
          >
            <Input.Password
              prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="Password"
              className="!bg-slate-50 !border-slate-300 !text-slate-900 hover:!border-red-500 focus:!border-red-500 !rounded-xl"
            />
          </Form.Item>

          <Button
            type="primary"
            danger
            htmlType="submit"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
            block
            className="h-12 text-base font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none shadow-lg shadow-red-500/25 mt-2"
          >
            {client_id ? 'Sign In & Authorize' : 'Sign In to SSO Admin'}
          </Button>
        </Form>

        {/* Quick Account Preset Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="text-[11px] text-slate-400 font-bold mb-3 tracking-wider uppercase">
            Demo SSO Quick Accounts
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <Tag
              color="gold"
              className="cursor-pointer px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity text-xs font-semibold"
              onClick={() => fillQuickAccount('master1@mayora.com')}
            >
              👑 Master Admin
            </Tag>
            <Tag
              color="red"
              className="cursor-pointer px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity text-xs font-semibold"
              onClick={() => fillQuickAccount('manager1@mayora.com')}
            >
              💼 Asset Manager
            </Tag>
            <Tag
              color="purple"
              className="cursor-pointer px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity text-xs font-semibold"
              onClick={() => fillQuickAccount('approver1@mayora.com')}
            >
              ✅ Approver
            </Tag>
            <Tag
              color="green"
              className="cursor-pointer px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity text-xs font-semibold"
              onClick={() => fillQuickAccount('user1@mayora.com')}
            >
              👤 Regular User
            </Tag>
          </div>
        </div>
      </Card>
    </div>
  )
}
