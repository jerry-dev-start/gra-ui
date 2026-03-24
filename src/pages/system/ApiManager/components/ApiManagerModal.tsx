import { useEffect, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import type { ApiManagerFormValues, ApiManagerRecord, ApiMethod, ApiStatus } from '@/types/api'

interface ApiManagerModalProps {
  open: boolean
  editRecord: ApiManagerRecord | null
  onOk: (values: ApiManagerFormValues) => Promise<void> | void
  onCancel: () => void
}

const methodOptions: { label: ApiMethod; value: ApiMethod }[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

const statusOptions: { label: string; value: ApiStatus }[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
]

function ApiManagerModal({ open, editRecord, onOk, onCancel }: ApiManagerModalProps) {
  const [form] = Form.useForm<ApiManagerFormValues>()
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }

    if (editRecord) {
      form.setFieldsValue({
        path: editRecord.path,
        method: editRecord.method,
        groupName: editRecord.groupName,
        permissionCode: editRecord.permissionCode,
        desc: editRecord.desc,
        status: editRecord.status,
      })
      return
    }

    form.resetFields()
    form.setFieldsValue({
      status: 1,
    })
  }, [open, editRecord, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setConfirmLoading(true)
      await onOk(values)
    } catch {
      // 表单校验失败或提交失败时交由上层处理
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <Modal
      title={editRecord ? '编辑接口' : '新增接口'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        className="pt-4"
      >
        <Form.Item
          label="接口地址"
          name="path"
          rules={[{ required: true, message: '请输入接口地址' }]}
        >
          <Input placeholder="请输入接口地址" />
        </Form.Item>
        <Form.Item
          label="请求方式"
          name="method"
          rules={[{ required: true, message: '请选择请求方式' }]}
        >
          <Select placeholder="请选择请求方式" options={methodOptions} />
        </Form.Item>
        <Form.Item
          label="接口分组"
          name="groupName"
          rules={[{ required: true, message: '请输入接口分组' }]}
        >
          <Input placeholder="请输入接口分组" />
        </Form.Item>
        <Form.Item label="授权码" name="permissionCode">
          <Input placeholder="请输入授权码" />
        </Form.Item>
        <Form.Item label="接口描述" name="desc">
          <Input.TextArea placeholder="请输入接口描述" rows={3} showCount maxLength={200} />
        </Form.Item>
        <Form.Item label="状态" name="status" initialValue={1}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ApiManagerModal
