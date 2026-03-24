import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Tag, Popconfirm, message, Card, Row, Col, Tooltip,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, LockOutlined, SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { RoleRecord, RoleParams } from '@/types/role.ts'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role.ts'
import PermissionDrawer from './PermissionDrawer.tsx'

function RolePage() {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<RoleRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<RoleRecord | null>(null)
  const [form] = Form.useForm<RoleParams>()
  const [searchForm] = Form.useForm()
  const [permDrawerOpen, setPermDrawerOpen] = useState(false)
  const [permRole, setPermRole] = useState<RoleRecord | null>(null)

  const handlePerm = (record: RoleRecord) => {
    setPermRole(record)
    setPermDrawerOpen(true)
  }

  const fetchData = async (p = page, ps = pageSize) => {
    setLoading(true)
    try {
      const { roleName, roleCode, status } = searchForm.getFieldsValue()
      const data = await getRoleList({
        roleName: roleName || undefined,
        roleCode: roleCode || undefined,
        status: status ?? undefined,
        page: p,
        pageSize: ps,
      })
      setDataSource(data?.list ?? [])
      setTotal(data?.total ?? 0)
    } catch {
      message.error('加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
    form.setFieldsValue({ status: 1, sortOrder: 0 })
    setModalOpen(true)
  }

  const handleEdit = (record: RoleRecord) => {
    setEditRecord(record)
    form.setFieldsValue({
      roleName: record.roleName,
      roleCode: record.roleCode,
      description: record.description,
      sortOrder: record.sortOrder,
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id)
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
        await updateRole({ ...values, id: editRecord.id })
        message.success('更新成功')
      } else {
        await createRole(values)
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

  const columns: ColumnsType<RoleRecord> = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      width: 150,
      render: (v: string, record) => (
        <Space size={4}>
          {!!record.isReadonly && (
            <Tooltip title="系统内置"><LockOutlined style={{ color: '#faad14' }} /></Tooltip>
          )}
          {v}
        </Space>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      width: 150,
      render: (v: string) => <Tag icon={<SafetyCertificateOutlined />}>{v}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      align: 'center',
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
      title: '创建时间',
      dataIndex: 'createdAt',
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
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handlePerm(record)}>
            权限
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {!record.isReadonly && (
            <Popconfirm title="确定删除该角色？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
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
              <Form.Item name="roleName" style={{ marginBottom: 0 }}>
                <Input placeholder="角色名称" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="roleCode" style={{ marginBottom: 0 }}>
                <Input placeholder="角色编码" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="状态"
                  allowClear
                  style={{ width: 120 }}
                  options={[
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 0 },
                  ]}
                />
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
        title="角色管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        }
      >
        <Table<RoleRecord>
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 'max-content' }}
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
        title={editRecord ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} style={{ marginTop: 24 }}>
          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如 管理员" />
          </Form.Item>
          <Form.Item
            label="角色编码"
            name="roleCode"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="如 admin" disabled={!!editRecord} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="角色描述" rows={3} />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <PermissionDrawer
        open={permDrawerOpen}
        role={permRole}
        onClose={() => setPermDrawerOpen(false)}
      />
    </>
  )
}

export default RolePage
