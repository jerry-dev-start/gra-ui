import { useState, useMemo } from 'react'
import { Popover, Input, Empty } from 'antd'
import * as Icons from '@ant-design/icons'
import './index.css'

// 预生成 Outlined 图标列表（仅首次加载时计算）
const outlinedIcons: string[] = Object.keys(Icons).filter(
  (key) =>
    key.endsWith('Outlined') &&
    key[0] === key[0].toUpperCase() &&
    typeof (Icons as any)[key] === 'object',
)

interface IconPickerProps {
  value?: string
  onChange?: (value: string) => void
}

function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return outlinedIcons
    const kw = search.toLowerCase()
    return outlinedIcons.filter((name) => name.toLowerCase().includes(kw))
  }, [search])

  const handleSelect = (name: string) => {
    onChange?.(name)
    setOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onChange?.('')
  }

  // 渲染当前选中的图标
  const SelectedIcon = value ? (Icons as any)[value] : null

  const content = (
    <div className="icon-picker-dropdown">
      <Input
        placeholder="搜索图标..."
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div className="icon-picker-grid">
        {filtered.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无匹配图标" />
        ) : (
          filtered.map((name) => {
            const Comp = (Icons as any)[name]
            return (
              <div
                key={name}
                className={`icon-picker-item${value === name ? ' selected' : ''}`}
                title={name}
                onClick={() => handleSelect(name)}
              >
                <Comp style={{ fontSize: 20 }} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      overlayStyle={{ width: 360 }}
    >
      <Input
        readOnly
        placeholder="点击选择图标"
        value={value || ''}
        prefix={SelectedIcon ? <SelectedIcon style={{ fontSize: 16 }} /> : undefined}
        suffix={
          value ? (
            <span
              className="icon-picker-clear"
              onClick={(e) => { e.stopPropagation(); handleClear() }}
            >
              ×
            </span>
          ) : null
        }
        style={{ cursor: 'pointer' }}
      />
    </Popover>
  )
}

export default IconPicker
