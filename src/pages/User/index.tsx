import { useEffect, useState, useMemo } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, Select,
  Tag, Popconfirm, message, Card, Avatar, Row, Col, Tree, Empty, Pagination,
} from 'antd'
import type { TreeProps } from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, UserOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { User, UserParams } from '@/types/user'
import type { RoleRecord } from '@/types/role'
import type { DeptRecord } from '@/types/dept'
import { getUserList, getUserDetail, createUser, updateUser, deleteUser } from '@/api/user'
import { getAllRoles } from '@/api/role'
import { getDeptTree } from '@/api/dept'

/** 将部门树转为 antd Tree 需要的 DataNode 格式 */
function toTreeData(list: DeptRecord[]): TreeProps['treeData'] {
  return list.map((item) => ({
    key: item.id,
    title: item.deptName,
    children: item.children?.length ? toTreeData(item.children) : undefined,
  }))
}

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

  // 部门树状态
  const [deptTree, setDeptTree] = useState<DeptRecord[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<string>()
  const [deptLoading, setDeptLoading] = useState(false)

  const treeData = useMemo(() => toTreeData(deptTree), [deptTree])
  // const expandedKeys = useMemo(() => collectKeys(deptTree), [deptTree])

  const fetchDeptTree = async () => {
    setDeptLoading(true)
    try {
      const data = await getDeptTree()
      setDeptTree(data ?? [])
    } catch {
      message.error('加载部门树失败')
    } finally {
      setDeptLoading(false)
    }
  }

  const fetchData = async (p = page, ps = pageSize, deptId = selectedDeptId) => {
    setLoading(true)
    try {
      const { username, phoneNumber } = searchForm.getFieldsValue()
      const data = await getUserList({
        username: username || undefined,
        phoneNumber: phoneNumber || undefined,
        deptId: deptId || undefined,
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
    fetchDeptTree()
    getAllRoles().then(setRoleOptions).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeptSelect: TreeProps['onSelect'] = (selectedKeys) => {
    const deptId = selectedKeys.length ? String(selectedKeys[0]) : undefined
    setSelectedDeptId(deptId)
    setPage(1)
    fetchData(1, pageSize, deptId)
  }

  const handleSearch = () => {
    setPage(1)
    fetchData(1, pageSize)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setSelectedDeptId(undefined)
    setPage(1)
    fetchData(1, pageSize, undefined)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <Card style={{ marginBottom: 16, flexShrink: 0 }}>
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

      <Row gutter={16} style={{ flex: 1, alignItems: 'stretch', minHeight: 0 }}>
        {/* 左侧：部门树 */}
        <Col flex="280px" style={{ display: 'flex' }}>
          <Card
            title={
              <Space>
                <ApartmentOutlined />
                <span>部门列表</span>
              </Space>
            }
            size="small"
            styles={{ body: { padding: '8px 4px', flex: 1, overflow: 'auto' } }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            loading={deptLoading}
          >
            {treeData?.length ? (
              <Tree
                treeData={treeData}
                defaultExpandAll
                selectedKeys={selectedDeptId ? [selectedDeptId] : []}
                onSelect={handleDeptSelect}
                blockNode
                style={{ padding: '4px 0' }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无部门" />
            )}
          </Card>
        </Col>

        {/* 右侧：用户列表 */}
        <Col flex="1" style={{ display: 'flex', minHeight: 0 }}>
          <Card
            title="用户管理"
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' } }}
            extra={
              <Space>
                {selectedDeptId && (
                  <Tag
                    closable
                    onClose={() => {
                      setSelectedDeptId(undefined)
                      setPage(1)
                      fetchData(1, pageSize, undefined)
                    }}
                    color="blue"
                  >
                    已筛选部门
                  </Tag>
                )}
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增用户
                </Button>
              </Space>
            }
          >
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              <Table<User>
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                scroll={{ x: 1080 }}
                size="middle"
                pagination={false}
              />
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showQuickJumper
                showTotal={(t) => `共 ${t} 条`}
                onChange={handlePageChange}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>

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
    </div>
  )
}

export default UserPage
