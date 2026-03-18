import { Form, Input, Select, Button, Space, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { DeptQuery } from '@/types/dept'

interface DeptSearchProps {
  onSearch: (values: DeptQuery) => void
  onReset: () => void
}

function DeptSearch({ onSearch, onReset }: DeptSearchProps) {
  const [form] = Form.useForm<DeptQuery>()

  const handleSearch = () => {
    const values = form.getFieldsValue()
    onSearch({
      name: values.name || undefined,
      status: values.status ?? undefined,
    })
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  return (
    <Form form={form} layout="inline">
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col>
          <Form.Item name="name" style={{ marginBottom: 0 }}>
            <Input placeholder="部门名称" allowClear />
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
  )
}

export default DeptSearch
