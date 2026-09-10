import React from 'react'
import { LogOut, RefreshCw, Globe } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ssoService } from '../../services/ssoService'
import type { SSOSession } from '../../types/sso'
import { Table, Button, Tag, message, Card, Tooltip } from 'antd'

export const SessionsManagementPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading: loading } = useQuery<SSOSession[]>({
    queryKey: ['admin', 'sessions'],
    queryFn: () => ssoService.getSessions(),
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })

  const handleRevokeSession = async (id: string) => {
    try {
      await ssoService.revokeSession(id)
      message.success('Session revoked immediately')
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to revoke session')
    }
  }

  const columns = [
    {
      title: 'User Identity',
      key: 'user',
      render: (_: any, record: SSOSession) => (
        <div>
          <div className="font-bold text-slate-900">{record.user?.name || record.user_id}</div>
          <div className="text-xs text-slate-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string) => (
        <span className="font-mono text-xs text-red-700 font-bold flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          {ip || '127.0.0.1'}
        </span>
      ),
    },
    {
      title: 'Client User Agent',
      dataIndex: 'user_agent',
      key: 'user_agent',
      render: (ua: string) => <div className="text-xs text-slate-500 truncate max-w-xs">{ua || 'Unknown Browser'}</div>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => <span className="font-mono text-xs text-slate-500">{new Date(time).toLocaleString()}</span>,
    },
    {
      title: 'Expires At',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (time: string) => (
        <Tag color="green" className="font-mono text-xs font-bold">
          {new Date(time).toLocaleTimeString()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SSOSession) => (
        <Tooltip title="Revoke Session (Remote Logout)">
          <Button
            size="small"
            danger
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={() => handleRevokeSession(record.id)}
            className="rounded-lg font-bold"
          >
            Revoke Session
          </Button>
        </Tooltip>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active User Sessions</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time authenticated SSO sessions across all connected applications with 1-click remote session kill.
          </p>
        </div>
        <Button
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={handleRefresh}
          loading={loading}
          className="!bg-white !border-slate-300 !text-slate-700 hover:!border-red-500"
        >
          Refresh Sessions
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
