import React from 'react'
import { Link, useNavigate } from 'react-router'
import { ShieldCheck, LogOut, Terminal, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Tag, Avatar } from 'antd'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-700 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Mayora SSO</span>
              <Tag color="red" className="!text-[10px] !px-1.5 !py-0 border-red-200 bg-red-50 text-red-700 font-bold">
                ENTERPRISE
              </Tag>
            </div>
            <p className="text-xs text-slate-500 font-medium">Single Sign-On & Identity Provider</p>
          </div>
        </Link>

        {/* Quick Nav Links & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/sso/demo-client"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            OAuth2 Tester
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1.5">
                  {user.name}
                  {user.is_master && (
                    <Tag color="gold" className="!m-0 !text-[10px] font-bold">
                      MASTER
                    </Tag>
                  )}
                </span>
                <span className="text-[11px] text-slate-500">{user.email}</span>
              </div>
              <Avatar
                size="default"
                className="bg-gradient-to-br from-red-600 to-rose-700 font-bold text-white shadow-sm"
              >
                {user.name?.charAt(0) || 'U'}
              </Avatar>
              <Button
                type="text"
                danger
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="!text-slate-400 hover:!text-red-600"
              />
            </div>
          ) : (
            <Link to="/sso/login">
              <Button type="primary" danger className="bg-red-600 hover:bg-red-700 font-semibold shadow-xs">
                SSO Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
