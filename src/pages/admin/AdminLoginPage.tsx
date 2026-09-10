import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ShieldCheck, ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react'
import { ssoService } from '../../services/ssoService'
import { useAuth } from '../../context/AuthContext'
import { Alert, Button, Form, Input, Card } from 'antd'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin, login } = useAuth()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [form] = Form.useForm()

  // Already logged in as admin → redirect immediately
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  const handleSubmit = async (values: { username_or_email: string; password: string }) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const resp = await ssoService.login({
        username_or_email: values.username_or_email,
        password: values.password,
        // No client_id → pure SSO admin login (no OAuth2 code flow)
      })

      if (!resp.user?.is_master) {
        setErrorMsg('Access denied: your account does not have admin privileges.')
        return
      }

      login(resp.user, resp.session_token)
      navigate('/admin', { replace: true })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-100 via-slate-50 to-slate-100 p-4 relative overflow-hidden">
      {/* Background Decorator Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 blur-[120px] rounded-full pointer-events-none" />

      <Card
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden text-slate-800"
        styles={{ body: { padding: '1.5rem 2rem 2rem' } }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Mayora SSO — Restricted Access</p>

          {/* Access restriction notice */}
          <div className="mt-4 flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              Only <span className="font-bold">Master Admin</span> accounts can access this panel.
            </p>
          </div>
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
          size="large"
        >
          <Form.Item
            name="username_or_email"
            rules={[{ required: true, message: 'Please input email or employee number' }]}
          >
            <Input
              id="admin-login-email"
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
              id="admin-login-password"
              prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="Password"
              className="!bg-slate-50 !border-slate-300 !text-slate-900 hover:!border-red-500 focus:!border-red-500 !rounded-xl"
            />
          </Form.Item>

          <Button
            id="admin-login-submit"
            type="primary"
            danger
            htmlType="submit"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
            block
            className="h-12 text-base font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none shadow-lg shadow-red-500/25 mt-2"
          >
            Sign In to Admin Panel
          </Button>
        </Form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Mayora SSO Identity Provider · Admin Access Only
        </p>
      </Card>
    </div>
  )

}
