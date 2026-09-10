import React from 'react'
import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  AppWindow,
  Users,
  GitMerge,
  MonitorCheck,
  History,
  Terminal,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Connected Applications', path: '/admin/apps', icon: AppWindow },
    { label: 'SSO User Directory', path: '/admin/users', icon: Users },
    { label: 'App User Mappings', path: '/admin/mappings', icon: GitMerge },
    { label: 'Active User Sessions', path: '/admin/sessions', icon: MonitorCheck },
    { label: 'Audit & Access Logs', path: '/admin/audit-logs', icon: History },
  ]

  return (
    <aside className="w-64 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200 p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
        SSO Admin Control Center
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
          Developer Suite
        </div>
        <NavLink
          to="/sso/demo-client"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
            }`
          }
        >
          <Terminal className="w-4 h-4 text-rose-600" />
          OAuth2 Tester Playground
        </NavLink>
      </div>
    </aside>
  )
}
