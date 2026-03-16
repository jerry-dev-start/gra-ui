/**
 * 组件映射表 — 基于 Vite import.meta.glob 动态扫描
 * 新增页面只需在 src/pages/ 下创建文件，无需手动维护此表
 *
 * 后端菜单 component 字段格式：pages/Menu/index（不含前缀和后缀）
 */
const modules = import.meta.glob<{ default: React.ComponentType }>('../pages/**/index.tsx')

const componentMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {}

for (const [path, importFn] of Object.entries(modules)) {
  // "../pages/Menu/index.tsx" → "pages/Menu/index"
  const key = path.replace('../', '').replace('.tsx', '')
  componentMap[key] = importFn
}

export default componentMap
