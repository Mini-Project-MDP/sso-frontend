import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'

import { LoginPage } from './pages/auth/LoginPage'
import { DemoClientPage } from './pages/auth/DemoClientPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AppsManagement } from './pages/admin/AppsManagement'
import { UsersManagement } from './pages/admin/UsersManagement'
import { UserAppMappingPage } from './pages/admin/UserAppMapping'
import { SessionsManagementPage } from './pages/admin/SessionsManagement'
import { AuditLogsPage } from './pages/admin/AuditLogsPage'

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* SSO Auth & Playground Portal */}
          <Route path="/sso/login" element={<LoginPage />} />
          <Route path="/sso/demo-client" element={<DemoClientPage />} />

          {/* Admin Management Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="apps" element={<AppsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="mappings" element={<UserAppMappingPage />} />
            <Route path="sessions" element={<SessionsManagementPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
