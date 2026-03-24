import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select, Space, Table, Tag, message } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { createApi, deleteApi, getApiDetail, getApiManagerList, updateApi } from '@/api/apiManager'
import type { ApiManagerFormValues, ApiManagerPageResult, ApiManagerQuery, ApiManagerRecord, ApiMethod, ApiStatus } from '@/types/api'
import ApiManagerModal from './components/ApiManagerModal'

const methodOptions: { label: ApiMethod; value: ApiMethod }[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

const methodTagMap: Record<ApiMethod, { color: string }> = {
  GET: { color: 'blue' },
  POST: { color: 'green' },
  PUT: { color: 'gold' },
  DELETE: { color: 'red' },
  PATCH: { color: 'purple' },
}

const statusTagMap: Record<ApiStatus, { label: string; color: string }> = {
  1: { label: '启用', color: 'green' },
  2: { label: '禁用', color: 'red' },
}

function formatDateTime(value?: string) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function ApiManager() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<ApiManagerRecord[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ApiManagerRecord | null>(null)
  const [editLoadingId, setEditLoadingId] = useState<string>('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<string>('')

  const fetchData = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      const params: ApiManagerQuery = {
        path: values.path || undefined,
        method: values.method || undefined,
        groupName: values.groupName || undefined,
        status: values.status ?? undefined,
        page: currentPage,
        pageSize: currentPageSize,
      }

      const data = await getApiManagerList(params)
      setDataSource(normalizePageResult(data).list)
      setTotal(normalizePageResult(data).total)
    } catch {
      message.error('加载接口列表失败')
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
    form.resetFields()
    setPage(1)
    fetchData(1, pageSize)
  }

  const handlePageChange = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage)
    setPageSize(currentPageSize)
    fetchData(currentPage, currentPageSize)
  }

  const handleAdd = () => {
    setEditRecord(null)
    setModalOpen(true)
  }

  const handleEdit = async (id: string) => {
    setEditLoadingId(id)
    try {
      const detail = await getApiDetail(id)
      setEditRecord(detail)
      setModalOpen(true)
    } catch {
      message.error('加载接口详情失败')
    } finally {
      setEditLoadingId('')
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteLoadingId(id)
    try {
      await deleteApi(id)
      message.success('删除成功')
      const nextPage = dataSource.length === 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) {
        setPage(nextPage)
      }
      await fetchData(nextPage, pageSize)
    } catch {
      message.error('删除失败')
    } finally {
      setDeleteLoadingId('')
    }
  }

  const handleSubmit = async (values: ApiManagerFormValues) => {
    try {
      if (editRecord) {
        await updateApi({ id: editRecord.id, ...values })
        message.success('更新成功')
      } else {
        await createApi(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      await fetchData(page, pageSize)
    } catch {
      // 无操作
    }
  }

  const columns = useMemo<ColumnsType<ApiManagerRecord>>(() => [
    {
      title: '接口地址',
      dataIndex: 'path',
      width: 320,
      ellipsis: true,
      render: (value?: string) => value || '-',
    },
    {
      title: '请求方式',
      dataIndex: 'method',
      width: 110,
      align: 'center',
      render: (value?: ApiMethod) => {
        if (!value) return '-'
        const tag = methodTagMap[value] ?? { color: 'default' }
        return <Tag color={tag.color}>{value}</Tag>
      },
    },
    {
      title: '接口分组',
      dataIndex: 'groupName',
      width: 180,
      render: (value?: string) => value || '-',
    },
    {
      title: '授权码',
      dataIndex: 'permissionCode',
      width: 220,
      ellipsis: true,
      render: (value?: string) => value || '-',
    },
    {
      title: '接口状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value?: ApiStatus) => {
        if (value !== 2 && value !== 1) return '-'
        const tag = statusTagMap[value]
        return <Tag color={tag.color}>{tag.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            loading={editLoadingId === record.id}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除该接口？" onConfirm={() => handleDelete(record.id)}>
            <Button
              type="link"
              size="small"
              danger
              loading={deleteLoadingId === record.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [deleteLoadingId, editLoadingId])

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col>
              <Form.Item name="path" style={{ marginBottom: 0 }}>
                <Input placeholder="接口地址" allowClear style={{ width: 240 }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="method" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="请求方式"
                  allowClear
                  style={{ width: 140 }}
                  options={methodOptions}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="groupName" style={{ marginBottom: 0 }}>
                <Input placeholder="接口分组" allowClear style={{ width: 180 }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="接口状态"
                  allowClear
                  style={{ width: 140 }}
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
        title="接口管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增 API
          </Button>
        }
      >
        <Table<ApiManagerRecord>
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          size="middle"
          scroll={{ x: 1140 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `共 ${count} 条`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <ApiManagerModal
        open={modalOpen}
        editRecord={editRecord}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}

function normalizePageResult(data?: Partial<ApiManagerPageResult> & { items?: ApiManagerRecord[]; records?: ApiManagerRecord[]; pageList?: ApiManagerRecord[]; count?: number }) {
  return {
    list: data?.list ?? data?.items ?? data?.records ?? data?.pageList ?? [],
    total: data?.total ?? data?.count ?? 0,
  }
}

export default ApiManager
