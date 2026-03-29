import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Avatar, Button, Card, Form, Input, Modal, Spin, Tag, message, theme } from 'antd'
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
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/stores/user.ts'
import {editPassword, getCurrUserInfo, sendEmilaCode} from '@/api/user.ts'
import type { CurrentUserInfo } from '@/types/user.ts'
import './index.css'

const roleTagColors = ['#00c2ff', '#7b61ff', '#36cfc9', '#f759ab', '#faad14']

function formatDateTime(value?: string) {
  if (!value) return '--'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function Profile() {
  const { user } = useUserStore()
  const { token: t } = theme.useToken()
  const [profile, setProfile] = useState<CurrentUserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [passwordForm] = Form.useForm<{ email: string; verifyCode: string; newPassword: string; confirmPassword: string }>()

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCurrUserInfo()
      setProfile(data)
    } catch {
      setError('加载个人信息失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (codeCountdown <= 0) return
    const timer = window.setTimeout(() => {
      setCodeCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [codeCountdown])

  const roleNames = useMemo(() => profile?.roleName ?? [], [profile?.roleName])
  const roleCount = profile?.roleCount ?? roleNames.length
  const displayName = profile?.nickname || profile?.username || user?.nickname || user?.username || '--'
  const lastLoginText = formatDateTime(profile?.lastLoginDate)
  const lastLoginDateOnly = lastLoginText === '--' ? '--' : lastLoginText.split(' ')[0]

  const statusTag = useMemo(() => {
    if (user?.status === 1) return <Tag color="success" bordered={false}>正常</Tag>
    if (user?.status === 0) return <Tag color="error" bordered={false}>禁用</Tag>
    return <Tag bordered={false}>未知</Tag>
  }, [user?.status])

  const handleOpenPasswordModal = () => {
    passwordForm.resetFields()
    passwordForm.setFieldValue('email', profile?.email || '')
    setPasswordModalOpen(true)
  }

  const handleCancelPasswordModal = () => {
    setPasswordModalOpen(false)
    passwordForm.resetFields()
    setCodeCountdown(0)
  }

  const handleSendVerifyCode = async () => {
    if (sendingCode || codeCountdown > 0) return
    try {
      const email = passwordForm.getFieldValue('email') || profile?.email
      if (!email) {
        message.warning('请先填写邮箱地址')
        return
      }
      setSendingCode(true)
      await sendEmilaCode({ email })
      message.success('验证码发送成功')
      setCodeCountdown(60)
    } catch {
      message.error('验证码发送失败，请稍后重试')
    } finally {
      setSendingCode(false)
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordSubmitting(true)

      if (values.verifyCode.trim().length < 4) {
        message.warning('请输入正确的邮箱验证码')
        return
      }


      await editPassword(values).then(()=>{
        setPasswordModalOpen(false)
        passwordForm.resetFields()
      }).finally(() => {
        setCodeCountdown(0)
      })

    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button size="small" type="text" icon={<ReloadOutlined />} onClick={() => void loadProfile()}>
              重试
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading} tip="加载个人信息中...">
        <Card
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        >
          <div className="profile-banner">
            <div className="profile-banner-pattern" />
          </div>

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
                {!user?.avatar && (displayName.charAt(0) || '?')}
              </Avatar>
            </div>
            <div className="profile-user-brief">
              <div className="profile-user-name" style={{ color: t.colorText }}>
                {displayName}
              </div>
              <div className="profile-user-role-tag">
                {statusTag}
                <Tag bordered={false} color="processing">{roleCount} 个角色</Tag>
              </div>
            </div>
          </div>

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
                {profile?.username || '--'}
              </div>
              <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
                用户名
              </div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-value" style={{ color: '#36cfc9' }}>
                {profile?.lastLoginDate ? '已登录' : '--'}
              </div>
              <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
                当前状态
              </div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-value" style={{ color: '#f759ab' }}>
                {lastLoginDateOnly}
              </div>
              <div className="profile-stat-label" style={{ color: t.colorTextSecondary }}>
                最后登录
              </div>
            </div>
          </div>

          <div style={{ height: 16 }} />
        </Card>

        <div className="profile-grid" style={{ marginTop: 16 }}>
          <Card
            title={<span><IdcardOutlined style={{ marginRight: 8, color: '#00c2ff' }} />基本信息</span>}
            style={{ borderRadius: 12 }}
          >
            <InfoItem
              icon={<UserOutlined />}
              color="#00c2ff"
              label="用户名"
              value={profile?.username}
            />
            <InfoItem
              icon={<IdcardOutlined />}
              color="#7b61ff"
              label="昵称"
              value={profile?.nickname}
            />
            <InfoItem
              icon={<MailOutlined />}
              color="#36cfc9"
              label="邮箱"
              value={profile?.email}
            />
            <InfoItem
              icon={<PhoneOutlined />}
              color="#f759ab"
              label="手机号"
              value={profile?.phoneNumber}
            />
            <InfoItem
              icon={<CalendarOutlined />}
              color="#faad14"
              label="最后登录"
              value={lastLoginText}
            />
          </Card>

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
              actionText="修改密码"
              onAction={handleOpenPasswordModal}
            />
            <SecurityItem
              icon={<MailOutlined />}
              color="#36cfc9"
              label="邮箱绑定"
              desc={profile?.email || '未绑定'}
              status={profile?.email ? 'set' : 'unset'}
            />
            <SecurityItem
              icon={<PhoneOutlined />}
              color="#f759ab"
              label="手机绑定"
              desc={profile?.phoneNumber || '未绑定'}
              status={profile?.phoneNumber ? 'set' : 'unset'}
            />
            <SecurityItem
              icon={<KeyOutlined />}
              color="#faad14"
              label="两步验证"
              desc="未开启"
              status="unset"
            />
          </Card>

          <Card
            title={<span><ClockCircleOutlined style={{ marginRight: 8, color: '#36cfc9' }} />登录信息</span>}
            style={{ borderRadius: 12 }}
          >
            <InfoItem
              icon={<CalendarOutlined />}
              color="#36cfc9"
              label="最近登录时间"
              value={lastLoginText}
            />
            <InfoItem
              icon={<UserOutlined />}
              color="#7b61ff"
              label="登录账号"
              value={profile?.username}
            />
          </Card>

          <Card
            title={<span><SafetyOutlined style={{ marginRight: 8, color: '#f759ab' }} />角色权限</span>}
            style={{ borderRadius: 12 }}
          >
            {roleNames.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roleNames.map((roleName, idx) => (
                  <Tag
                    key={roleName}
                    color={roleTagColors[idx % roleTagColors.length]}
                    style={{ padding: '4px 12px', fontSize: 13, borderRadius: 6 }}
                  >
                    {roleName}
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
      </Spin>

      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onCancel={handleCancelPasswordModal}
        onOk={() => void handlePasswordSubmit()}
        confirmLoading={passwordSubmitting}
        okText="确认修改"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" preserve={false}>
          <Form.Item
            label="邮箱"
            name="email"

            initialValue={profile?.email || ''}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" disabled />
          </Form.Item>
          <Form.Item
            label="邮箱验证码"
            required
          >
            <Input.Group compact>
              <Form.Item
                name="verifyCode"
                noStyle
                rules={[{ required: true, message: '请输入邮箱验证码' }]}
              >
                <Input style={{ width: 'calc(100% - 120px)' }}  placeholder="请输入邮箱验证码" />
              </Form.Item>
              <Button
                style={{ width: 120 }}
                loading={sendingCode}
                disabled={sendingCode || codeCountdown > 0}
                onClick={() => void handleSendVerifyCode()}
              >
                {codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '新密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

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

function SecurityItem({ icon, color, label, desc, status, actionText, onAction }: {
  icon: React.ReactNode
  color: string
  label: string
  desc: string
  status: 'set' | 'unset'
  actionText?: string
  onAction?: () => void
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
      <div className="profile-security-right">
        {actionText && onAction && (
          <Button type="link" className="profile-security-action" onClick={onAction}>
            {actionText}
          </Button>
        )}
        {status === 'set'
          ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          : <Tag color="warning" bordered={false}>未设置</Tag>
        }
      </div>
    </div>
  )
}

export default Profile
