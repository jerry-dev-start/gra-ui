import { useEffect, useState } from 'react'
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  Select, Switch, Tag, Popconfirm, message, Card,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FolderOutlined, MenuOutlined, KeyOutlined,
} from '@ant-design/icons'
import * as Icons from '@ant-design/icons'
import IconPicker from '@/components/IconPicker'
import type { ColumnsType } from 'antd/es/table'
import type { MenuRecord, MenuParams, MenuType } from '@/types/menu'
import { getAllMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const menuTypeMap: Record<MenuType, { label: string; color: string; icon: React.ReactNode }> = {
  directory: { label: '目录', color: 'blue', icon: <FolderOutlined /> },
  menu: { label: '菜单', color: 'green', icon: <MenuOutlined /> },
  button: { label: '按钮', color: 'orange', icon: <KeyOutlined /> },
}

/** 将菜单树展平为 [{ id, name }] 用于父级选择 */
function flattenTree(tree: MenuRecord[], prefix = ''): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const node of tree) {
    const label = prefix ? `${prefix} / ${node.name}` : node.name
    result.push({ id: node.id, name: label })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, label))
    }
  }
  return result
}

function MenuPage() {
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<MenuRecord[]>([])
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<MenuRecord | null>(null)
  const [form] = Form.useForm<MenuParams>()

  const collectParentKeys = (list: MenuRecord[]): string[] => {
    const keys: string[] = []
    for (const node of list) {
      if (node.children?.length) {
        keys.push(node.id)
        keys.push(...collectParentKeys(node.children))
      }
    }
    return keys
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await getAllMenuTree()
      const menus = data ?? []
      setTreeData(menus)
      setExpandedRowKeys(collectParentKeys(menus))
    } catch {
      message.error('加载菜单失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = (parentId = '0') => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ parentId, type: 'directory' as MenuType, sort: 0, visible: true, status: 1 })
    setModalOpen(true)
  }

  const handleEdit = (record: MenuRecord) => {
    setEditRecord(record)
    form.setFieldsValue({
      parentId: record.parentId,
      name: record.name,
      type: record.type,
      path: record.path,
      component: record.component,
      icon: record.icon,
      permission: record.permission,
      sort: record.sort,
      visible: record.visible,
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMenu(id)
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
        await updateMenu({ ...values, id: editRecord.id })
        message.success('更新成功')
      } else {
        await createMenu(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      // 表单校验失败，不处理
    }
  }

  // === COLUMNS ===
  const columns: ColumnsType<MenuRecord> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      align: 'center',
      render: (type: MenuType) => {
        const info = menuTypeMap[type]
        return <Tag icon={info.icon} color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      align: 'center',
      render: (v: string) => {
        if (!v) return '-'
        const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[v]
        return IconComp ? <IconComp style={{ fontSize: 18 }} /> : v
      },
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      width: 180,
      render: (v: string) => v || '-',
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      width: 200,
      render: (v: string, record) => record.type === 'menu' ? (v || '-') : '-',
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      width: 180,
      render: (v: string) => v ? <Tag>{v}</Tag> : '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 70,
      align: 'center',
    },
    {
      title: '可见',
      dataIndex: 'visible',
      width: 70,
      align: 'center',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      align: 'center',
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.type !== 'button' && (
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record.id)}>
              添加
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该菜单？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // === JSX ===
  const parentOptions = [
    { id: '0', name: '顶级菜单' },
    ...flattenTree(treeData),
  ]

  return (
    <>
      <Card
        title="菜单管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增菜单
          </Button>
        }
      >
        <Table<MenuRecord>
          rowKey="id"
          columns={columns}
          dataSource={treeData}
          loading={loading}
          pagination={false}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>

      <Modal
        title={editRecord ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} style={{ marginTop: 24 }}>
          <Form.Item label="父级菜单" name="parentId" rules={[{ required: true, message: '请选择父级菜单' }]}>
            <Select
              options={parentOptions.map((p) => ({ label: p.name, value: p.id }))}
              placeholder="请选择父级菜单"
            />
          </Form.Item>
          <Form.Item label="菜单类型" name="type" rules={[{ required: true, message: '请选择菜单类型' }]}>
            <Select
              options={[
                { label: '目录', value: "directory" },
                { label: '菜单', value: "menu" },
                { label: '按钮', value: "button" },
              ]}
            />
          </Form.Item>
          <Form.Item label="菜单名称" name="name" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type') as string
              return (
                <>
                  {type !== 'button' && (
                    <Form.Item label="路由路径" name="path">
                      <Input placeholder="如 /users" />
                    </Form.Item>
                  )}
                  {type === 'menu' && (
                    <Form.Item label="组件路径" name="component">
                      <Input placeholder="如 pages/User/index" />
                    </Form.Item>
                  )}
                  {type !== 'button' && (
                    <Form.Item label="图标" name="icon">
                      <IconPicker />
                    </Form.Item>
                  )}
                  {type === 'button' && (
                    <Form.Item label="权限标识" name="permission" rules={[{ required: true, message: '请输入权限标识' }]}>
                      <Input placeholder="如 system:user:list" />
                    </Form.Item>
                  )}
                  {type !== 'button' && (
                    <Form.Item label="权限标识" name="permission">
                      <Input placeholder="如 system:user:list" />
                    </Form.Item>
                  )}
                </>
              )
            }}
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="是否可见" name="visible" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
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
    </>
  )
}

export default MenuPage
