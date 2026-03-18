import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, TreeSelect } from 'antd'
import type { DeptRecord, DeptParams } from '@/types/dept'

interface DeptModalProps {
  open: boolean
  editRecord: DeptRecord | null
  treeData: DeptRecord[]
  onOk: (values: DeptParams) => void
  onCancel: () => void
  /** 新增时的默认父级 ID */
  defaultParentId?: string
}

/** 将部门树转为 TreeSelect 的 treeData 格式 */
function toTreeSelectData(
  tree: DeptRecord[],
  disabledId?: string,
): { title: string; value: string; disabled?: boolean; children?: any[] }[] {
  return tree.map((node) => ({
    title: node.name,
    value: node.id,
    disabled: node.id === disabledId,
    children: node.children?.length
      ? toTreeSelectData(node.children, disabledId)
      : undefined,
  }))
}

function DeptModal({ open, editRecord, treeData, onOk, onCancel, defaultParentId = '0' }: DeptModalProps) {
  const [form] = Form.useForm<DeptParams>()

  useEffect(() => {
    if (!open) return
    if (editRecord) {
      form.setFieldsValue({
        parentId: editRecord.parentId,
        name: editRecord.name,
        leader: editRecord.leader,
        phone: editRecord.phone,
        email: editRecord.email,
        sort: editRecord.sort,
        status: editRecord.status,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ parentId: defaultParentId, sort: 0, status: 1 })
    }
  }, [open, editRecord, defaultParentId, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        onOk({ ...values, id: editRecord.id })
      } else {
        onOk(values)
      }
    } catch {
      // 表单校验失败
    }
  }

  // 编辑时不能选自己和自己的子节点作为父级
  const parentTreeData = [
    { title: '顶级部门', value: '0', children: toTreeSelectData(treeData, editRecord?.id) },
  ]

  return (
    <Modal
      title={editRecord ? '编辑部门' : '新增部门'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        className="pt-4"
      >
        <Form.Item
          label="上级部门"
          name="parentId"
          rules={[{ required: true, message: '请选择上级部门' }]}
        >
          <TreeSelect
            treeData={parentTreeData}
            treeDefaultExpandAll
            placeholder="请选择上级部门"
          />
        </Form.Item>
        <Form.Item
          label="部门名称"
          name="name"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>
        <Form.Item label="负责人" name="leader">
          <Input placeholder="请输入负责人" />
        </Form.Item>
        <Form.Item
          label="联系电话"
          name="phone"
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', validateTrigger: 'onBlur' }]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item label="排序" name="sort">
          <InputNumber min={0} className="!w-full" />
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
  )
}

export default DeptModal
