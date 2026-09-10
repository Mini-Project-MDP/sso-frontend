import React from 'react'
import { Link } from 'react-router'
import {
  AppWindow,
  Users,
  MonitorCheck,
  History,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ssoService } from '../../services/ssoService'
import type { StatsResponse, AuditLog, ClientApp } from '../../types/sso'
import { Card, Tag, Button, Avatar } from 'antd'

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: stats } = useQuery<StatsResponse | null>({
    queryKey: ['admin', 'stats'],
    queryFn: () => ssoService.getStats().catch(() => null),
  })

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => ssoService.getAuditLogs().catch(() => []),
  })

  const { data: apps = [] } = useQuery<ClientApp[]>({
    queryKey: ['admin', 'apps'],
    queryFn: () => ssoService.getApps().catch(() => []),
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] })
  }

  const statCards = [
    {
      title: 'Connected Applications',
      value: stats?.total_apps ?? apps.length,
      icon: AppWindow,
      color: 'from-red-600 to-rose-600',
      badge: 'Active Clients',
      link: '/admin/apps',
    },
    {
      title: 'Registered SSO Users',
      value: stats?.total_users ?? 4,
      icon: Users,
      color: 'from-rose-600 to-pink-600',
      badge: 'Corporate Identities',
      link: '/admin/users',
    },
    {
      title: 'Active Sessions',
      value: stats?.active_sessions ?? 1,
      icon: MonitorCheck,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Live Logged In',
      link: '/admin/sessions',
    },
    {
      title: 'Logins Today',
      value: stats?.logins_today ?? 12,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      badge: 'SSO Authentications',
      link: '/admin/audit-logs',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SSO Dashboard Overview</h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time status of Mayora Single Sign-On Identity Provider & Connected Client Applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            loading={isLoading}
            className="!bg-white !border-slate-300 !text-slate-700 hover:!border-red-500"
          >
            Refresh Stats
          </Button>
          <Link to="/admin/apps">
            <Button type="primary" danger icon={<Plus className="w-4 h-4" />} className="bg-red-600 font-bold shadow-xs">
              Register New App
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Link key={idx} to={card.link}>
              <Card className="bg-white border-slate-200 shadow-xs rounded-2xl hover:border-red-300 hover:shadow-md transition-all hover:-translate-y-1 duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{card.value}</div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${card.color} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{card.badge}</span>
                  <span className="text-red-600 font-bold flex items-center gap-0.5">
                    Manage <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Two Column Layout: Connected Apps & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Applications List */}
        <Card
          title={
            <div className="flex justify-between items-center text-slate-900 font-bold text-sm">
              <span className="flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-red-600" />
                Connected Applications
              </span>
              <Link to="/admin/apps" className="text-xs text-red-600 hover:underline">
                View All
              </Link>
            </div>
          }
          className="bg-white border-slate-200 shadow-xs rounded-2xl"
        >
          <div className="space-y-3">
            {apps.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar shape="square" size={40} src={app.logo_url} className="bg-slate-200">
                    {app.name.charAt(0)}
                  </Avatar>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{app.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{app.client_id}</div>
                  </div>
                </div>
                <Tag color={app.is_active ? 'green' : 'red'} className="font-bold">
                  {app.is_active ? 'ACTIVE' : 'DISABLED'}
                </Tag>
              </div>
            ))}
          </div>
        </Card>

        {/* Audit Log Activity Stream */}
        <Card
          title={
            <div className="flex justify-between items-center text-slate-900 font-bold text-sm">
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-rose-600" />
                Recent SSO Audit Events
              </span>
              <Link to="/admin/audit-logs" className="text-xs text-red-600 hover:underline">
                View Log Ledger
              </Link>
            </div>
          }
          className="bg-white border-slate-200 shadow-xs rounded-2xl"
        >
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Tag
                      color={
                        log.event_type.includes('SUCCESS') || log.event_type.includes('GRANTED')
                          ? 'red'
                          : log.event_type.includes('FAILED')
                          ? 'volcano'
                          : 'purple'
                      }
                      className="!m-0 font-mono text-[10px] font-bold"
                    >
                      {log.event_type}
                    </Tag>
                    <span className="text-slate-800 font-semibold">
                      {log.user?.name || log.ip_address || 'System'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate max-w-xs">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
