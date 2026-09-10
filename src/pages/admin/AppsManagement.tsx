import React, { useState } from 'react'
import { Plus, Key, Trash2, Eye, EyeOff } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ssoService } from '../../services/ssoService'
import type { ClientApp } from '../../types/sso'
import { Table, Button, Tag, Modal, Form, Input, Switch, message, Tooltip, Card } from 'antd'

export const AppsManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({})
  const [form] = Form.useForm()

  const { data: apps = [], isLoading: loading } = useQuery<ClientApp[]>({
    queryKey: ['admin', 'apps'],
    queryFn: () => ssoService.getApps(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] })

  const handleCreateApp = async (values: any) => {
    try {
      await ssoService.createApp(values)
      message.success('Client Application registered successfully!')
      setCreateModalOpen(false)
      form.resetFields()
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to register client application')
    }
  }

  const handleRotateSecret = async (id: string) => {
    try {
      await ssoService.rotateSecret(id)
      message.success('Client secret rotated successfully!')
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to rotate secret')
    }
  }

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await ssoService.toggleAppStatus(id, active)
      message.success('App status updated')
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update app status')
    }
  }

  const handleDeleteApp = async (id: string) => {
    try {
      await ssoService.deleteApp(id)
      message.success('Application deleted')
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to delete app')
    }
  }

  const columns = [
    {
      title: 'Application',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ClientApp) => (
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-2">
            {name}
            {record.client_id === 'app_asset_mgmt_123' && (
              <Tag color="red" className="!m-0 text-[10px] font-bold">
                ASSET SYSTEM
              </Tag>
            )}
          </div>
          <div className="text-xs text-slate-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Client Credentials',
      key: 'credentials',
      render: (_: any, record: ClientApp) => {
        const isShown = showSecretMap[record.id]
        return (
          <div className="space-y-1 font-mono text-xs">
            <div>
              <span className="text-slate-400">ID:</span> <span className="text-red-700 font-bold">{record.client_id}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Secret:</span>
              <span className="text-amber-700 font-semibold">
                {isShown ? record.client_secret : '••••••••••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() =>
                  setShowSecretMap((prev) => ({ ...prev, [record.id]: !prev[record.id] }))
                }
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Redirect URIs',
      dataIndex: 'redirect_uris',
      key: 'redirect_uris',
      render: (uris: string) => (
        <div className="max-w-xs text-xs font-mono text-slate-600 break-words">
          {uris.split(',').map((u, i) => (
            <div key={i} className="truncate" title={u.trim()}>
              {u.trim()}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Allowed Scopes',
      dataIndex: 'allowed_scopes',
      key: 'allowed_scopes',
      render: (scopes: string) => (
        <div className="flex flex-wrap gap-1">
          {scopes.split(' ').map((s, i) => (
            <Tag key={i} color="red" className="!m-0 text-[10px] font-semibold">
              {s}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ClientApp) => (
        <Switch
          checked={record.is_active}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          checkedChildren="ACTIVE"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClientApp) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Rotate Client Secret">
            <Button
              size="small"
              icon={<Key className="w-3.5 h-3.5" />}
              onClick={() => handleRotateSecret(record.id)}
              className="!bg-amber-50 !border-amber-200 !text-amber-700 hover:!border-amber-400"
            />
          </Tooltip>
          <Tooltip title="Delete App Registration">
            <Button
              size="small"
              danger
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => handleDeleteApp(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connected Applications</h1>
          <p className="text-xs text-slate-500 font-medium">
            Register external client applications (OAuth2 clients), configure redirect URIs & rotate secrets.
          </p>
        </div>
        <Button
          type="primary"
          danger
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-red-600 font-bold shadow-xs"
        >
          Register Client App
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <Table
          columns={columns}
          dataSource={apps}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal: Register App */}
      <Modal
        title="Register New Connected Application"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateApp} className="mt-4">
          <Form.Item name="name" label="Application Name" rules={[{ required: true }]}>
            <Input placeholder="Mayora Asset Management System" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input placeholder="Corporate Asset Tracking & Approval Workflow System" />
          </Form.Item>

          <Form.Item
            name="redirect_uris"
            label="Authorized Redirect URIs (comma-separated)"
            rules={[{ required: true }]}
            initialValue="http://localhost:5173/sso/callback"
          >
            <Input placeholder="http://localhost:5173/sso/callback, http://localhost:5174/sso/demo-client" />
          </Form.Item>

          <Form.Item name="allowed_scopes" label="Allowed OAuth2 Scopes" initialValue="openid profile email roles">
            <Input placeholder="openid profile email roles" />
          </Form.Item>

          <Form.Item name="logo_url" label="Logo URL">
            <Input placeholder="https://example.com/logo.png" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
