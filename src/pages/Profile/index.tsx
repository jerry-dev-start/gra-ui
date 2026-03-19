import { useMemo } from 'react'
import { Avatar, Card, Tag, theme, Tooltip } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  SafetyOutlined,
  LockOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DesktopOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/stores/user'
import './index.css'

/* ── 模拟数据（后续可对接真实接口） ── */

const loginLogs = [
  { ip: '192.168.1.100', device: 'Chrome / Windows', time: '2026-03-18 09:32', color: '#00c2ff' },
  { ip: '192.168.1.100', device: 'Chrome / Windows', time: '2026-03-17 14:15', color: '#36cfc9' },
  { ip: '10.0.0.52', device: 'Safari / macOS', time: '2026-03-16 08:47', color: '#7b61ff' },
  { ip: '192.168.1.100', device: 'Chrome / Windows', time: '2026-03-15 10:03', color: '#f759ab' },
]

function Profile() {
  const { user } = useUserStore()
  const { token: t } = theme.useToken()

  const statusTag = useMemo(() => {
    if (user?.status === 1) return <Tag color="success" bordered={false}>正常</Tag>
    if (user?.status === 0) return <Tag color="error" bordered={false}>禁用</Tag>
    return <Tag bordered={false}>未知</Tag>
  }, [user?.status])

  const roleCount = user?.roleIds?.length ?? 0

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* ── 顶部卡片：Banner + 头像 + 统计 ── */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        {/* Banner */}
        <div className="profile-banner">
          <div className="profile-banner-pattern" />
        </div>

        {/* 头像 + 姓名 */}
        <div
          className="profile-avatar-section"
          style={{ '--avatar-border': t.colorBgContainer } as React.CSSProperties}
        >
          <div className="profile-avatar-wrapper">
            <Avatar
              size={96}
              src={user?.avatar || undefined}
              icon={!user?.avatar && <UserOutlined />}
              style={{
                background: !user?.avatar
                  ? 'linear-gradient(135deg, #00c2ff, #7b61ff)'
                  : undefined,
                fontSize: 36,
              }}
            >
              {!user?.avatar && (user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?')}
            </Avatar>
          </div>
          <div className="profile-user-brief">
            <div className="profile-user-name" style={{ color: t.colorText }}>
              {user?.nickname || user?.username || '--'}
            </div>
            <div className="profile-user-role-tag">
              {statusTag}
              <Tag bordered={false} color="processing">{roleCount} 个角色</Tag>
            </div>
          </div>
        </div>

        {/* 统计条 */}
        <div
          className="profile-stats"
          style={{ '--stat-divider': t.colorBorderSecondary } as React.CSSProperties}
        >
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: '#00c2ff' }}>
              {roleCount}
            </div>
            <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
              角色
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: '#7b61ff' }}>
              {loginLogs.length}
            </div>
            <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
              近期登录
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: '#36cfc9' }}>
              {user?.lastLoginDate ? '在线' : '--'}
            </div>
            <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
              当前状态
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: '#f759ab' }}>
              {user?.lastLoginDate?.split(' ')[0] || '--'}
            </div>
            <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
              最后登录
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />
      </Card>

      {/* ── 信息卡片网格 ── */}
      <div className="profile-grid">
        {/* 基本信息 */}
        <Card
          title={<span><IdcardOutlined style={{ marginRight: 8, color: '#00c2ff' }} />基本信息</span>}
          style={{ borderRadius: 12 }}
        >
          <InfoItem
            icon={<UserOutlined />}
            color="#00c2ff"
            label="用户名"
            value={user?.username}
          />
          <InfoItem
            icon={<IdcardOutlined />}
            color="#7b61ff"
            label="昵称"
            value={user?.nickname}
          />
          <InfoItem
            icon={<MailOutlined />}
            color="#36cfc9"
            label="邮箱"
            value={user?.email}
          />
          <InfoItem
            icon={<PhoneOutlined />}
            color="#f759ab"
            label="手机号"
            value={user?.phoneNumber}
          />
          <InfoItem
            icon={<CalendarOutlined />}
            color="#faad14"
            label="最后登录"
            value={user?.lastLoginDate}
          />
        </Card>

        {/* 安全设置 */}
        <Card
          title={<span><SafetyOutlined style={{ marginRight: 8, color: '#7b61ff' }} />安全设置</span>}
          style={{ borderRadius: 12 }}
        >
          <SecurityItem
            icon={<LockOutlined />}
            color="#00c2ff"
            label="登录密码"
            desc="已设置"
            status="set"
          />
          <SecurityItem
            icon={<MailOutlined />}
            color="#36cfc9"
            label="邮箱绑定"
            desc={user?.email || '未绑定'}
            status={user?.email ? 'set' : 'unset'}
          />
          <SecurityItem
            icon={<PhoneOutlined />}
            color="#f759ab"
            label="手机绑定"
            desc={user?.phoneNumber || '未绑定'}
            status={user?.phoneNumber ? 'set' : 'unset'}
          />
          <SecurityItem
            icon={<KeyOutlined />}
            color="#faad14"
            label="两步验证"
            desc="未开启"
            status="unset"
          />
        </Card>

        {/* 登录日志 */}
        <Card
          title={<span><ClockCircleOutlined style={{ marginRight: 8, color: '#36cfc9' }} />登录日志</span>}
          style={{ borderRadius: 12 }}
        >
          {loginLogs.map((log, idx) => (
            <div className="profile-log-item" key={idx}>
              <div className="profile-log-dot" style={{ background: log.color }} />
              <Tooltip title={log.ip}>
                <span className="profile-log-text" style={{ color: t.colorText }}>
                  <DesktopOutlined style={{ marginRight: 6, opacity: 0.5 }} />
                  {log.device}
                  <span style={{ opacity: 0.45, marginLeft: 8 }}>{log.ip}</span>
                </span>
              </Tooltip>
              <span className="profile-log-time" style={{ color: t.colorTextSecondary }}>
                {log.time}
              </span>
            </div>
          ))}
        </Card>

        {/* 角色权限 */}
        <Card
          title={<span><SafetyOutlined style={{ marginRight: 8, color: '#f759ab' }} />角色权限</span>}
          style={{ borderRadius: 12 }}
        >
          {roleCount > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user?.roleIds?.map((id, idx) => (
                <Tag
                  key={id}
                  color={['#00c2ff', '#7b61ff', '#36cfc9', '#f759ab', '#faad14'][idx % 5]}
                  style={{ padding: '4px 12px', fontSize: 13, borderRadius: 6 }}
                >
                  角色 ID: {id}
                </Tag>
              ))}
            </div>
          ) : (
            <div style={{ color: t.colorTextSecondary, textAlign: 'center', padding: 24 }}>
              暂无分配角色
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ── 子组件 ── */

function InfoItem({ icon, color, label, value }: {
  icon: React.ReactNode
  color: string
  label: string
  value?: string
}) {
  return (
    <div className="profile-info-item">
      <div
        className="profile-info-icon"
        style={{ color, background: `${color}18` }}
      >
        {icon}
      </div>
      <div className="profile-info-content">
        <div className="profile-info-label">{label}</div>
        <div className="profile-info-value">{value || '--'}</div>
      </div>
    </div>
  )
}

function SecurityItem({ icon, color, label, desc, status }: {
  icon: React.ReactNode
  color: string
  label: string
  desc: string
  status: 'set' | 'unset'
}) {
  return (
    <div className="profile-security-item">
      <div className="profile-security-left">
        <div
          className="profile-security-icon"
          style={{ color, background: `${color}18` }}
        >
          {icon}
        </div>
        <div className="profile-info-content">
          <div className="profile-info-label">{label}</div>
          <div className="profile-info-value">{desc}</div>
        </div>
      </div>
      {status === 'set'
        ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        : <Tag color="warning" bordered={false}>未设置</Tag>
      }
    </div>
  )
}

export default Profile
