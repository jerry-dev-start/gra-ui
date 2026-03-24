import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tag, message } from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getApiManagerList } from '@/api/apiManager'
import type { ApiManagerPageResult, ApiManagerQuery, ApiManagerRecord, ApiMethod, ApiStatus } from '@/types/api'

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
  0: { label: '禁用', color: 'red' },
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
      title: '接口状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value?: ApiStatus) => {
        if (value !== 0 && value !== 1) return '-'
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
  ], [])

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

      <Card title="接口管理">
        <Table<ApiManagerRecord>
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          size="middle"
          scroll={{ x: 920 }}
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
