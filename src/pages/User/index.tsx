import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Select,
  Tag, Popconfirm, message, Card, Avatar, Row, Col,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, UserOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { User, UserParams } from '@/types/user'
import type { RoleRecord } from '@/types/role'
import { getUserList, getUserDetail, createUser, updateUser, deleteUser } from '@/api/user'
import { getAllRoles } from '@/api/role'

function UserPage() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<User | null>(null)
  const [roleOptions, setRoleOptions] = useState<RoleRecord[]>([])
  const [form] = Form.useForm<UserParams>()
  const [searchForm] = Form.useForm()

  const fetchData = async (p = page, ps = pageSize) => {
    setLoading(true)
    try {
      const { username, phoneNumber } = searchForm.getFieldsValue()
      const data = await getUserList({
        username: username || undefined,
        phoneNumber: phoneNumber || undefined,
        page: p,
        pageSize: ps,
      })
      setDataSource(data?.list ?? [])
      setTotal(data?.total ?? 0)
    } catch {
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    getAllRoles().then(setRoleOptions).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1)
    fetchData(1, pageSize)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setPage(1)
    fetchData(1, pageSize)
  }

  const handleAdd = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: 1 })
    setModalOpen(true)
  }

  const handleEdit = async (record: User) => {
    setEditRecord(record)
    form.resetFields()
    setModalOpen(true)
    try {
      const detail = await getUserDetail(record.id!)
      if (detail) {
        form.setFieldsValue({
          username: detail.username,
          nickname: detail.nickname,
          avatar: detail.avatar,
          email: detail.email,
          phoneNumber: detail.phoneNumber,
          status: detail.status,
          roleIds: detail.roleIds ?? [],
        })
      }
    } catch {
      message.error('获取用户详情失败')
      setModalOpen(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        await updateUser({ ...values, id: editRecord.id })
        message.success('更新成功')
      } else {
        await createUser(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      // 表单校验失败，不处理
    }
  }

  const handlePageChange = (p: number, ps: number) => {
    setPage(p)
    setPageSize(ps)
    fetchData(p, ps)
  }

  const columns: ColumnsType<User> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 70,
      align: 'center',
      render: (v: string, record) => (
        <Avatar
          src={v || undefined}
          icon={!v ? <UserOutlined /> : undefined}
          style={{ backgroundColor: v ? undefined : '#1677ff' }}
        >
          {!v && (record.nickname?.charAt(0) || record.username?.charAt(0))}
        </Avatar>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 130,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 130,
      render: (v: string) => v || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      render: (v: string) => v || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      align: 'center',
      render: (v: number) => (
        <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginDate',
      width: 180,
      render: (v: string) => {
        if (!v) return '-'
        const d = new Date(v)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(record.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // PLACEHOLDER_COLUMNS

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col>
              <Form.Item name="username" style={{ marginBottom: 0 }}>
                <Input placeholder="用户名" prefix={<UserOutlined />} allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="phoneNumber" style={{ marginBottom: 0 }}>
                <Input placeholder="手机号" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      >
        <Table<User>
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 1080 }}
          size="middle"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <Modal
        title={editRecord ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={720}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!editRecord} />
              </Form.Item>
            </Col>
            {!editRecord && (
              <Col span={12}>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item label="昵称" name="nickname">
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="头像" name="avatar">
                <Input placeholder="头像地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[{ type: 'email', message: '邮箱格式不正确' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="phoneNumber">
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status">
                <Select
                  options={[
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="角色"
                name="roleIds"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                style={{ marginRight: 'calc(50% * 1 / 24 + 8px)' }}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择角色"
                  allowClear
                  optionFilterProp="label"
                  options={roleOptions.map(r => ({ label: r.roleName, value: r.id }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default UserPage
