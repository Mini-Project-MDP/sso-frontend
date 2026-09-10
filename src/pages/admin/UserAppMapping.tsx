import React, { useState } from 'react'
import { Plus, Trash2, AppWindow } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ssoService } from '../../services/ssoService'
import type { UserAppMapping, SSOUser, ClientApp } from '../../types/sso'
import { Table, Button, Tag, Modal, Form, Input, Select, message, Card, Tooltip } from 'antd'

export const UserAppMappingPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: mappings = [], isLoading: loading } = useQuery<UserAppMapping[]>({
    queryKey: ['admin', 'mappings'],
    queryFn: () => ssoService.getMappings(),
  })

  const { data: users = [] } = useQuery<SSOUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => ssoService.getUsers(),
  })

  const { data: apps = [] } = useQuery<ClientApp[]>({
    queryKey: ['admin', 'apps'],
    queryFn: () => ssoService.getApps(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'mappings'] })

  const handleCreateMapping = async (values: any) => {
    try {
      const permsArray = values.permissions
        ? values.permissions.split(',').map((p: string) => p.trim())
        : ['*']

      await ssoService.createMapping({
        user_id: values.user_id,
        app_id: values.app_id,
        external_user_id: values.external_user_id,
        app_role: values.app_role,
        permissions: permsArray,
      })

      message.success('User application mapping created/updated successfully!')
      setCreateModalOpen(false)
      form.resetFields()
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to map user to application')
    }
  }

  const handleDeleteMapping = async (id: string) => {
    try {
      await ssoService.deleteMapping(id)
      message.success('Mapping removed')
      invalidate()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to remove mapping')
    }
  }

  const columns = [
    {
      title: 'SSO Global Identity',
      key: 'user',
      render: (_: any, record: UserAppMapping) => (
        <div>
          <div className="font-bold text-slate-900">{record.user?.name || record.user_id}</div>
          <div className="text-xs text-slate-500">
            {record.user?.email} | <span className="font-mono text-red-700 font-bold">{record.user?.employee_no}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Target Application',
      key: 'app',
      render: (_: any, record: UserAppMapping) => (
        <div>
          <div className="font-extrabold text-red-700 flex items-center gap-1.5">
            <AppWindow className="w-3.5 h-3.5" />
            {record.app?.name || record.app_id}
          </div>
          <div className="text-xs font-mono text-slate-400">{record.app?.client_id}</div>
        </div>
      ),
    },
    {
      title: 'External App User ID',
      dataIndex: 'external_user_id',
      key: 'external_user_id',
      render: (extId: string) => (
        <span className="font-mono text-xs text-amber-700 font-bold">{extId || 'AUTO_PROVISIONED'}</span>
      ),
    },
    {
      title: 'App Role',
      dataIndex: 'app_role',
      key: 'app_role',
      render: (role: string) => <Tag color="gold" className="font-mono font-bold text-xs">{role}</Tag>,
    },
    {
      title: 'Granted App Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permsStr: string) => {
        let perms: string[] = []
        try {
          perms = JSON.parse(permsStr)
        } catch {
          perms = [permsStr]
        }
        return (
          <div className="flex flex-wrap gap-1">
            {perms.map((p, i) => (
              <Tag key={i} color="red" className="!m-0 text-[10px] font-mono font-semibold">
                {p}
              </Tag>
            ))}
          </div>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserAppMapping) => (
        <Tooltip title="Remove Mapping">
          <Button
            size="small"
            danger
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => handleDeleteMapping(record.id)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application User & Role Mappings</h1>
          <p className="text-xs text-slate-500 font-medium">
            Map central SSO identities to external target application user IDs, roles, and granular permissions.
          </p>
        </div>
        <Button
          type="primary"
          danger
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-red-600 font-bold shadow-xs"
        >
          Create App User Mapping
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <Table
          columns={columns}
          dataSource={mappings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal: Create Mapping */}
      <Modal
        title="Map SSO User to Connected Application"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateMapping} className="mt-4">
          <Form.Item name="user_id" label="Select SSO Identity User" rules={[{ required: true }]}>
            <Select
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.employee_no} - ${u.email})`,
              }))}
              placeholder="Select user"
            />
          </Form.Item>

          <Form.Item name="app_id" label="Select Target Connected Application" rules={[{ required: true }]}>
            <Select
              options={apps.map((a) => ({
                value: a.id,
                label: `${a.name} (${a.client_id})`,
              }))}
              placeholder="Select client app"
            />
          </Form.Item>

          <Form.Item name="external_user_id" label="External User ID in Target App" initialValue="EXT-EMP001">
            <Input placeholder="EXT-EMP001" />
          </Form.Item>

          <Form.Item name="app_role" label="Application Role" rules={[{ required: true }]} initialValue="ASSET_MANAGER">
            <Select
              options={[
                { value: 'MASTER_ADMIN', label: 'MASTER_ADMIN' },
                { value: 'ASSET_MANAGER', label: 'ASSET_MANAGER' },
                { value: 'APPROVER', label: 'APPROVER' },
                { value: 'SALES_ADMIN', label: 'SALES_ADMIN' },
                { value: 'STAFF', label: 'STAFF' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Granted Permissions (comma-separated)"
            initialValue="asset:read, asset:create, asset:edit, asset:approve"
          >
            <Input placeholder="asset:read, asset:create, asset:edit" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
