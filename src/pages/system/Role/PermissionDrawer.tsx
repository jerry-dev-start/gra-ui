import { useEffect, useMemo, useState, type Key, type ReactNode } from 'react'
import { Button, Drawer, Empty, Space, Spin, Tabs, Tag, Tooltip, Tree, message, theme } from 'antd'
import {
  ApartmentOutlined,
  ApiOutlined,
  FolderOutlined,
  KeyOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import type { TreeDataNode } from 'antd'
import { getApiPermissionTree } from '@/api/apiManager'
import { getAllMenuTree } from '@/api/menu.ts'
import { getRoleMenuIds, saveRoleMenus } from '@/api/role.ts'
import type { ApiMethod, ApiPermissionTreeGroup, ApiPermissionTreeLeaf } from '@/types/api'
import type { MenuRecord } from '@/types/menu.ts'
import type { RoleRecord } from '@/types/role.ts'

interface Props {
  open: boolean
  role: RoleRecord | null
  onClose: () => void
  onSaved?: () => void
}

const API_PERMISSION_SUPPORTED = false

const typeIconMap: Record<string, ReactNode> = {
  directory: <FolderOutlined style={{ marginRight: 4 }} />,
  menu: <MenuOutlined style={{ marginRight: 4 }} />,
  button: <KeyOutlined style={{ marginRight: 4 }} />,
}

const apiMethodTagMap: Record<ApiMethod, { color: string }> = {
  GET: { color: 'blue' },
  POST: { color: 'green' },
  PUT: { color: 'gold' },
  DELETE: { color: 'red' },
  PATCH: { color: 'purple' },
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

function normalizeApiPath(api: ApiPermissionTreeLeaf) {
  const value = api.path?.trim() || api.apiUrl?.trim()
  return value || '-'
}

function collectApiParentKeys(groups: ApiPermissionTreeGroup[]): string[] {
  return groups.map((group) => `group:${group.groupName}`)
}

function collectApiLeafKeys(groups: ApiPermissionTreeGroup[]): string[] {
  return groups.flatMap((group) => (group.children ?? []).map((api) => String(api.id)))
}

function toApiTreeData(
  groups: ApiPermissionTreeGroup[],
  colorText: string,
  colorTextSecondary: string,
): TreeDataNode[] {
  return groups.map((group) => {
    const children = (group.children ?? []).map((api) => {
      const path = normalizeApiPath(api)
      const methodTag = apiMethodTagMap[api.method] ?? { color: 'default' }

      return {
        key: String(api.id),
        isLeaf: true,
        title: (
          <Tooltip title={api.desc || path}>
            <Space size={8} style={{ maxWidth: '100%' }}>
              <Tag color={methodTag.color} style={{ marginInlineEnd: 0 }}>
                {api.method}
              </Tag>
              <span style={{ fontFamily: 'Menlo, Monaco, Consolas, monospace', color: colorText }}>{path}</span>
            </Space>
          </Tooltip>
        ),
      }
    })

    return {
      key: `group:${group.groupName}`,
      title: (
        <Space size={8}>
          <span style={{ color: colorText }}>{group.groupName || '未分组'}</span>
          <span style={{ fontSize: 12, color: colorTextSecondary }}>
            {children.length} 个接口
          </span>
        </Space>
      ),
      children,
    }
  })
}

function PermissionDrawer({ open, role, onClose, onSaved }: Props) {
  const { token } = theme.useToken()
  const [activeTab, setActiveTab] = useState<'menu' | 'api'>('menu')

  const [menuTree, setMenuTree] = useState<MenuRecord[]>([])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const [apiTree, setApiTree] = useState<ApiPermissionTreeGroup[]>([])
  const [apiCheckedKeys, setApiCheckedKeys] = useState<string[]>([])
  const [apiHalfCheckedKeys, setApiHalfCheckedKeys] = useState<string[]>([])
  const [apiExpandedKeys, setApiExpandedKeys] = useState<string[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiSaving, setApiSaving] = useState(false)
  const [apiLoaded, setApiLoaded] = useState(false)

  const treeData = useMemo(() => toTreeData(menuTree), [menuTree])
  const parentKeys = useMemo(() => collectParentKeys(menuTree), [menuTree])
  const allLeafKeys = useMemo(() => collectLeafKeys(menuTree), [menuTree])

  const apiTreeData = useMemo(() => toApiTreeData(apiTree, token.colorText, token.colorTextSecondary), [apiTree, token.colorText, token.colorTextSecondary])
  const apiParentKeys = useMemo(() => collectApiParentKeys(apiTree), [apiTree])
  const apiLeafKeys = useMemo(() => collectApiLeafKeys(apiTree), [apiTree])

  useEffect(() => {
    if (!open || !role) return
    setLoading(true)
    Promise.all([getAllMenuTree(), getRoleMenuIds(role.id)])
      .then(([tree, ids]) => {
        const nextTree = tree ?? []
        const nextParentKeys = collectParentKeys(nextTree)
        setMenuTree(nextTree)
        setExpandedKeys(nextParentKeys)
        const leafIds = (ids ?? []).filter((id) => !nextParentKeys.includes(id))
        setCheckedKeys(leafIds)
        setHalfCheckedKeys([])
      })
      .catch(() => message.error('加载菜单权限数据失败'))
      .finally(() => setLoading(false))
  }, [open, role])

  useEffect(() => {
    if (!open) {
      setActiveTab('menu')
      setApiTree([])
      setApiCheckedKeys([])
      setApiHalfCheckedKeys([])
      setApiExpandedKeys([])
      setApiLoading(false)
      setApiSaving(false)
      setApiLoaded(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !role) return
    setApiTree([])
    setApiCheckedKeys([])
    setApiHalfCheckedKeys([])
    setApiExpandedKeys([])
    setApiLoading(false)
    setApiSaving(false)
    setApiLoaded(false)
  }, [open, role?.id])

  useEffect(() => {
    if (!open || !role || activeTab !== 'api' || apiLoaded) return

    setApiLoading(true)
    getApiPermissionTree()
      .then((tree) => {
        const nextTree = tree ?? []
        setApiTree(nextTree)
        setApiExpandedKeys(collectApiParentKeys(nextTree))
        setApiCheckedKeys([])
        setApiHalfCheckedKeys([])
      })
      .catch(() => {
        message.error('加载接口权限数据失败')
        setApiTree([])
      })
      .finally(() => {
        setApiLoaded(true)
        setApiLoading(false)
      })
  }, [activeTab, apiLoaded, open, role])

  /** 勾选后自动保存 */
  const autoSave = async (checked: string[], half: string[]) => {
    if (!role) return
    try {
      await saveRoleMenus(role.id, [...checked, ...half])
      message.success('菜单权限已保存')
      onSaved?.()
    } catch {
      message.error('菜单权限保存失败')
    }
  }

  const autoSaveApiPermissions = async (leafIds: string[]) => {
    if (!API_PERMISSION_SUPPORTED || !role) {
      void leafIds
      return
    }

    try {
      setApiSaving(true)
      message.success('接口权限已保存')
      onSaved?.()
    } catch {
      message.error('接口权限保存失败')
    } finally {
      setApiSaving(false)
    }
  }

  const handleCheck = (checked: unknown, info: { halfCheckedKeys?: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : (checked as { checked: Key[] }).checked
    const newChecked = keys.map(String)
    const newHalf = (info.halfCheckedKeys ?? []).map(String)
    setCheckedKeys(newChecked)
    setHalfCheckedKeys(newHalf)
    autoSave(newChecked, newHalf)
  }

  const handleApiCheck = (checked: unknown, info: { halfCheckedKeys?: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : (checked as { checked: Key[] }).checked
    const checkedNodeIds = keys.map(String)
    const leafSet = new Set(apiLeafKeys)
    const newChecked = checkedNodeIds.filter((key) => leafSet.has(key))
    const newHalf = (info.halfCheckedKeys ?? []).map(String).filter((key) => key.startsWith('group:'))

    console.log('api checked node ids:', checkedNodeIds)
    setApiCheckedKeys(newChecked)
    setApiHalfCheckedKeys(newHalf)
    void autoSaveApiPermissions(newChecked)
  }

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

  const handleApiCheckAll = () => {
    if (apiSaving) return

    if (apiCheckedKeys.length === apiLeafKeys.length) {
      setApiCheckedKeys([])
      setApiHalfCheckedKeys([])
      void autoSaveApiPermissions([])
    } else {
      setApiCheckedKeys(apiLeafKeys)
      setApiHalfCheckedKeys([])
      void autoSaveApiPermissions(apiLeafKeys)
    }
  }

  const handleExpandAll = () => {
    setExpandedKeys(expandedKeys.length === parentKeys.length ? [] : parentKeys)
  }

  const handleApiExpandAll = () => {
    setApiExpandedKeys(apiExpandedKeys.length === apiParentKeys.length ? [] : apiParentKeys)
  }

  return (
    <Drawer
      title={(
        <Space>
          <ApartmentOutlined />
          <span>设置权限 — {role?.roleName}</span>
        </Space>
      )}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      styles={{ body: { padding: '16px 24px', overflow: 'hidden' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'menu' | 'api')}
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
            children: apiLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Spin tip="加载中..." />
              </div>
            ) : apiTree.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <Empty description="暂无接口权限数据" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 148px)' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: token.borderRadius,
                  background: token.colorBgTextHover,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                    已选 {apiCheckedKeys.length} / {apiLeafKeys.length} 个接口
                    {apiHalfCheckedKeys.length > 0 ? ` · 半选分组 ${apiHalfCheckedKeys.length}` : ''}
                    {apiSaving ? ' · 保存中...' : ''}
                  </span>
                  <Space size="small">
                    <Button type="link" size="small" onClick={handleApiExpandAll}>
                      {apiExpandedKeys.length === apiParentKeys.length ? '折叠全部' : '展开全部'}
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleApiCheckAll}
                      disabled={apiSaving}
                    >
                      {apiCheckedKeys.length === apiLeafKeys.length ? '取消全选' : '全选'}
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
                    treeData={apiTreeData}
                    checkedKeys={apiCheckedKeys}
                    expandedKeys={apiExpandedKeys}
                    onExpand={(keys) => setApiExpandedKeys(keys.map(String))}
                    onCheck={handleApiCheck}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  )
}

export default PermissionDrawer
