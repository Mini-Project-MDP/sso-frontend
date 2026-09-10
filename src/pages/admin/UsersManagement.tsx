import React, { useEffect, useState } from 'react'
import { Plus, Crown } from 'lucide-react'
import { ssoService } from '../../services/ssoService'
import type { SSOUser } from '../../types/sso'
import { Table, Button, Tag, Modal, Form, Input, Switch, message, Card, Avatar } from 'antd'

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<SSOUser[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await ssoService.getUsers()
      setUsers(data || [])
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to fetch SSO users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (values: any) => {
    try {
      await ssoService.createUser(values)
      message.success('SSO User created successfully!')
      setCreateModalOpen(false)
      form.resetFields()
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to create user')
    }
  }

  const handleToggleMaster = async (id: string, isMaster: boolean) => {
    try {
      await ssoService.toggleMasterUser(id, isMaster)
      message.success('Master user status updated')
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update master status')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await ssoService.updateUserStatus(id, nextStatus)
      message.success(`User status updated to ${nextStatus}`)
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update user status')
    }
  }

  const columns = [
    {
      title: 'User Profile',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: SSOUser) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-gradient-to-br from-red-600 to-rose-600 font-bold text-white shadow-xs">
            {name.charAt(0)}
          </Avatar>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              {name}
              {record.is_master && (
                <Tag color="gold" icon={<Crown className="w-3 h-3 inline mr-1" />} className="!m-0 text-[10px] font-bold">
                  MASTER USER
                </Tag>
              )}
            </div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Employee No',
      dataIndex: 'employee_no',
      key: 'employee_no',
      render: (empNo: string) => <span className="font-mono text-xs text-red-700 font-bold">{empNo}</span>,
    },
    {
      title: 'Department & Position',
      key: 'dept',
      render: (_: any, record: SSOUser) => (
        <div className="text-xs">
          <div className="text-slate-800 font-semibold">{record.position || 'N/A'}</div>
          <div className="text-slate-500">{record.department || 'General'}</div>
        </div>
      ),
    },
    {
      title: 'Master Privilege',
      key: 'is_master',
      render: (_: any, record: SSOUser) => (
        <Switch
          checked={record.is_master}
          onChange={(checked) => handleToggleMaster(record.id, checked)}
          checkedChildren="MASTER"
          unCheckedChildren="REGULAR"
        />
      ),
    },
    {
      title: 'Account Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: SSOUser) => (
        <Button
          size="small"
          type={status === 'ACTIVE' ? 'primary' : 'default'}
          danger={status !== 'ACTIVE'}
          onClick={() => handleToggleStatus(record.id, status)}
          className="text-xs rounded-lg font-bold"
        >
          {status}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SSO User Directory</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage global Mayora corporate identities, master admin privileges & account access statuses.
          </p>
        </div>
        <Button
          type="primary"
          danger
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-red-600 font-bold shadow-xs"
        >
          Create SSO User
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-xs rounded-2xl">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal: Create User */}
      <Modal
        title="Create New SSO Corporate Identity"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser} className="mt-4">
          <Form.Item name="employee_no" label="Employee Number (e.g. EMP005)" rules={[{ required: true }]}>
            <Input placeholder="EMP005" />
          </Form.Item>

          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Eka Putra" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="eka.putra@mayora.com" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]} initialValue="Password123!">
            <Input.Password placeholder="Password123!" />
          </Form.Item>

          <Form.Item name="department" label="Department" initialValue="IT Enterprise">
            <Input placeholder="IT Enterprise Solutions" />
          </Form.Item>

          <Form.Item name="position" label="Position Title" initialValue="System Administrator">
            <Input placeholder="Senior System Administrator" />
          </Form.Item>

          <Form.Item name="is_master" label="Grant Master Privilege?" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
