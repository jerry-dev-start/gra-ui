import { useEffect, useState, useMemo } from 'react'
import { Drawer, Tabs, Tree, Button, Space, Spin, message, Empty, theme } from 'antd'
import {
  ApartmentOutlined, ApiOutlined, FolderOutlined,
  MenuOutlined, KeyOutlined,
} from '@ant-design/icons'
import type { TreeDataNode } from 'antd'
import type { MenuRecord } from '@/types/menu'
import type { RoleRecord } from '@/types/role'
import { getAllMenuTree } from '@/api/menu'
import { getRoleMenuIds, saveRoleMenus } from '@/api/role'

interface Props {
  open: boolean
  role: RoleRecord | null
  onClose: () => void
  onSaved?: () => void
}

const typeIconMap: Record<string, React.ReactNode> = {
  directory: <FolderOutlined style={{ marginRight: 4 }} />,
  menu: <MenuOutlined style={{ marginRight: 4 }} />,
  button: <KeyOutlined style={{ marginRight: 4 }} />,
}

/** 将 MenuRecord[] 转为 antd TreeDataNode[] */
function toTreeData(menus: MenuRecord[]): TreeDataNode[] {
  return menus.map((m) => ({
    key: m.id,
    title: (
      <span>{typeIconMap[m.type] || null}{m.name}</span>
    ),
    children: m.children?.length ? toTreeData(m.children) : undefined,
  }))
}

/** 收集树中所有父节点 key（有 children 的节点） */
function collectParentKeys(menus: MenuRecord[]): string[] {
  const keys: string[] = []
  for (const m of menus) {
    if (m.children?.length) {
      keys.push(m.id)
      keys.push(...collectParentKeys(m.children))
    }
  }
  return keys
}
/** 收集所有叶子节点 key */
function collectLeafKeys(menus: MenuRecord[]): string[] {
  const keys: string[] = []
  for (const m of menus) {
    if (m.children?.length) {
      keys.push(...collectLeafKeys(m.children))
    } else {
      keys.push(m.id)
    }
  }
  return keys
}

function PermissionDrawer({ open, role, onClose, onSaved }: Props) {
  const { token } = theme.useToken()
  const [menuTree, setMenuTree] = useState<MenuRecord[]>([])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const treeData = useMemo(() => toTreeData(menuTree), [menuTree])
  const parentKeys = useMemo(() => collectParentKeys(menuTree), [menuTree])
  const allLeafKeys = useMemo(() => collectLeafKeys(menuTree), [menuTree])

  // 加载菜单树 + 角色已有权限
  useEffect(() => {
    if (!open || !role) return
    setLoading(true)
    Promise.all([getAllMenuTree(), getRoleMenuIds(role.id)])
      .then(([tree, ids]) => {
        setMenuTree(tree ?? [])
        setExpandedKeys(collectParentKeys(tree ?? []))
        const leafIds = (ids ?? []).filter((id) => !collectParentKeys(tree ?? []).includes(id))
        setCheckedKeys(leafIds)
        setHalfCheckedKeys([])
      })
      .catch(() => message.error('加载权限数据失败'))
      .finally(() => setLoading(false))
  }, [open, role])

  /** 勾选后自动保存 */
  const autoSave = async (checked: string[], half: string[]) => {
    if (!role) return
    try {
      await saveRoleMenus(role.id, [...checked, ...half])
      message.success('权限已保存')
      onSaved?.()
    } catch {
      message.error('权限保存失败')
    }
  }

  const handleCheck = (checked: unknown, info: { halfCheckedKeys?: React.Key[] }) => {
    const keys = Array.isArray(checked) ? checked : (checked as { checked: React.Key[] }).checked
    const newChecked = keys.map(String)
    const newHalf = (info.halfCheckedKeys ?? []).map(String)
    setCheckedKeys(newChecked)
    setHalfCheckedKeys(newHalf)
    autoSave(newChecked, newHalf)
  }

  // 全选 / 取消全选
  const handleCheckAll = () => {
    if (checkedKeys.length === allLeafKeys.length) {
      setCheckedKeys([])
      setHalfCheckedKeys([])
      autoSave([], [])
    } else {
      setCheckedKeys(allLeafKeys)
      setHalfCheckedKeys([])
      autoSave(allLeafKeys, [])
    }
  }

  // 展开 / 折叠全部
  const handleExpandAll = () => {
    setExpandedKeys(expandedKeys.length === parentKeys.length ? [] : parentKeys)
  }

  return (
    <Drawer
      title={
        <Space>
          <ApartmentOutlined />
          <span>设置权限 — {role?.roleName}</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      styles={{ body: { padding: '16px 24px', overflow: 'hidden' } }}
    >
      <Tabs
        items={[
          {
            key: 'menu',
            label: (
              <span><MenuOutlined style={{ marginRight: 4 }} />菜单权限</span>
            ),
            children: loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin tip="加载中..." />
              </div>
            ) : menuTree.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <Empty description="暂无菜单数据" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 148px)' }}>
                <div style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  borderRadius: token.borderRadius,
                  background: token.colorBgTextHover,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                    已选 {checkedKeys.length + halfCheckedKeys.length} 项
                  </span>
                  <Space size="small">
                    <Button type="link" size="small" onClick={handleExpandAll}>
                      {expandedKeys.length === parentKeys.length ? '折叠全部' : '展开全部'}
                    </Button>
                    <Button type="link" size="small" onClick={handleCheckAll}>
                      {checkedKeys.length === allLeafKeys.length ? '取消全选' : '全选'}
                    </Button>
                  </Space>
                </div>
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  padding: '4px 0',
                  background: token.colorBgContainer,
                }}>
                  <Tree
                    checkable
                    blockNode
                    style={{ minHeight: '100%' }}
                    treeData={treeData}
                    checkedKeys={checkedKeys}
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => setExpandedKeys(keys.map(String))}
                    onCheck={handleCheck}
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'api',
            label: (
              <span><ApiOutlined style={{ marginRight: 4 }} />接口权限</span>
            ),
            children: (
              <Empty description="接口权限（待开发）" style={{ padding: '48px 0' }} />
            ),
          },
        ]}
      />
    </Drawer>
  )
}

export default PermissionDrawer
