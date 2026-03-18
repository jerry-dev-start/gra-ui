import { Form, Input, Select, Button, Space } from 'antd'
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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
      <Form form={form} layout="inline">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <Form.Item name="name" noStyle>
            <Input
              placeholder="部门名称"
              allowClear
              className="!w-48"
            />
          </Form.Item>
          <Form.Item name="status" noStyle>
            <Select
              placeholder="状态"
              allowClear
              className="!w-28"
              options={[
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]}
            />
          </Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  )
}

export default DeptSearch
