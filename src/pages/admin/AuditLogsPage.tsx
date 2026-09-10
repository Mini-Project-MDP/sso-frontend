import React from 'react'
import { RefreshCw } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ssoService } from '../../services/ssoService'
import type { AuditLog } from '../../types/sso'
import { Table, Button, Tag, message, Card } from 'antd'

export const AuditLogsPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: logs = [], isLoading: loading } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => ssoService.getAuditLogs(),
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => (
        <span className="font-mono text-xs text-slate-500">{new Date(time).toLocaleString()}</span>
      ),
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (type: string) => {
        let color = 'red'
        if (type.includes('SUCCESS') || type.includes('GRANTED') || type.includes('ISSUED')) color = 'red'
        if (type.includes('FAILED') || type.includes('REVOKED')) color = 'volcano'
        return <Tag color={color} className="font-mono font-bold text-xs">{type}</Tag>
      },
    },
    {
      title: 'SSO User / Identity',
      key: 'user',
      render: (_: any, record: AuditLog) => (
        <div>
          <div className="font-bold text-slate-900">{record.user?.name || record.user_id || 'Anonymous / System'}</div>
          <div className="text-xs text-slate-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Client Application',
      key: 'app',
      render: (_: any, record: AuditLog) => (
        <span className="text-xs font-bold text-red-700">
          {record.app?.name || record.app_id || 'Central SSO Portal'}
        </span>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string) => <span className="font-mono text-xs text-slate-600 font-semibold">{ip || '127.0.0.1'}</span>,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => <div className="font-mono text-xs text-slate-500 truncate max-w-xs">{details}</div>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-xs text-slate-500 font-medium">
            Immutable security event ledger recording all login attempts, token exchanges, app authorizations, and session revocations.
          </p>
        </div>
        <Button
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={handleRefresh}
          loading={loading}
          className="!bg-white !border-slate-300 !text-slate-700 hover:!border-red-500"
        >
          Refresh Logs
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  )
}
