import { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Popconfirm, message, Card, Tooltip } from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ApartmentOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  ExpandAltOutlined, ShrinkOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DeptRecord, DeptQuery, DeptParams } from '@/types/dept'
import { getDeptTree, createDept, updateDept, deleteDept } from '@/api/dept'
import DeptSearch from './components/DeptSearch'
import DeptModal from './components/DeptModal'

/** 收集树中所有 key */
function collectKeys(tree: DeptRecord[]): string[] {
  const keys: string[] = []
  for (const node of tree) {
    keys.push(node.id)
    if (node.children?.length) keys.push(...collectKeys(node.children))
  }
  return keys
}

/** 统计节点下所有子部门数量 */
function countChildren(node: DeptRecord): number {
  if (!node.children?.length) return 0
  return node.children.reduce((sum, child) => sum + 1 + countChildren(child), 0)
}

function DeptPage() {
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<DeptRecord[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<DeptRecord | null>(null)
  const [defaultParentId, setDefaultParentId] = useState('0')
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const fetchData = async (query?: DeptQuery) => {
    setLoading(true)
    try {
      const data = await getDeptTree(query)
      const tree = data ?? []
      setTreeData(tree)
      setExpandedKeys(collectKeys(tree))
    } catch {
      message.error('加载部门列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (values: DeptQuery) => fetchData(values)
  const handleReset = () => fetchData()

  const handleAdd = (parentId = '0') => {
    setEditRecord(null)
    setDefaultParentId(parentId)
    setModalOpen(true)
  }

  const handleEdit = (record: DeptRecord) => {
    setEditRecord(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDept(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: DeptParams) => {
    try {
      if (values.id) {
        await updateDept(values)
        message.success('更新成功')
      } else {
        await createDept(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchData()
    } catch {
      message.error('操作失败')
    }
  }

  const toggleExpand = () => {
    if (expandedKeys.length > 0) {
      setExpandedKeys([])
    } else {
      setExpandedKeys(collectKeys(treeData))
    }
  }

  const columns: ColumnsType<DeptRecord> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      width: 260,
      render: (v: string, record) => (
        <Space size={6}>
          <ApartmentOutlined style={{ color: '#00c2ff', fontSize: 15 }} />
          <span style={{ fontWeight: 500 }}>{v}</span>
          {!!record.children?.length && (
            <Tag color="processing" bordered={false} style={{ borderRadius: 10, marginLeft: 2 }}>
              {countChildren(record)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'leader',
      width: 120,
      render: (v: string) => v ? (
        <Space size={4}>
          <UserOutlined style={{ color: '#7b61ff', fontSize: 13 }} />
          {v}
        </Space>
      ) : '-',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 140,
      render: (v: string) => v ? (
        <Space size={4}>
          <PhoneOutlined style={{ color: '#36cfc9', fontSize: 13 }} />
          {v}
        </Space>
      ) : '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      ellipsis: true,
      render: (v: string) => v ? (
        <Space size={4}>
          <MailOutlined style={{ color: '#f759ab', fontSize: 13 }} />
          {v}
        </Space>
      ) : '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 70,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      align: 'center',
      render: (v: number) => (
        <Tag color={v === 1 ? 'success' : 'error'} bordered={false}>
          {v === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => {
        if (!v) return '-'
        const d = new Date(v)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record.id)}>
            添加
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该部门？"
            description={record.children?.length ? '该部门下存在子部门，将一并删除' : undefined}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <DeptSearch onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>部门管理</span>
            <Tag color="blue" bordered={false}>{collectKeys(treeData).length} 个部门</Tag>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title={expandedKeys.length > 0 ? '全部折叠' : '全部展开'}>
              <Button
                type="text"
                icon={expandedKeys.length > 0 ? <ShrinkOutlined /> : <ExpandAltOutlined />}
                onClick={toggleExpand}
              />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增部门
            </Button>
          </Space>
        }
      >
        <Table<DeptRecord>
          rowKey="id"
          columns={columns}
          dataSource={treeData}
          loading={loading}
          pagination={false}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowKeysChange: (keys) => setExpandedKeys(keys as string[]),
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      <DeptModal
        open={modalOpen}
        editRecord={editRecord}
        treeData={treeData}
        defaultParentId={defaultParentId}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}

export default DeptPage
