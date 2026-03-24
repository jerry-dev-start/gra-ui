import { Card, Col, Row, Statistic, theme, Tag } from 'antd'
import { UserOutlined, MenuOutlined, SafetyOutlined, RiseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Line, Column, Pie } from '@ant-design/charts'
import { useThemeStore } from '@/stores/theme'
import './index.css'
import FileUpload from "@/components/Upload/FileUpload.tsx";

/* ── 模拟数据 ── */

const visitData = [
  { date: '03-11', value: 320 },
  { date: '03-12', value: 450 },
  { date: '03-13', value: 380 },
  { date: '03-14', value: 590 },
  { date: '03-15', value: 480 },
  { date: '03-16', value: 620 },
  { date: '03-17', value: 750 },
]

const moduleData = [
  { module: '用户管理', count: 1240 },
  { module: '菜单管理', count: 860 },
  { module: '角色管理', count: 650 },
  { module: '系统设置', count: 430 },
  { module: '日志审计', count: 980 },
]

const roleData = [
  { type: '超级管理员', value: 3 },
  { type: '运维工程师', value: 8 },
  { type: '开发人员', value: 15 },
  { type: '普通用户', value: 42 },
  { type: '访客', value: 12 },
]

const activityData = [
  { user: 'admin', action: '修改了菜单「系统管理」的排序', time: '2 分钟前', color: '#00c2ff' },
  { user: 'zhangsan', action: '新增了用户「李四」', time: '15 分钟前', color: '#36cfc9' },
  { user: 'admin', action: '更新了角色「运维工程师」的权限', time: '1 小时前', color: '#7b61ff' },
  { user: 'wangwu', action: '删除了菜单「测试页面」', time: '2 小时前', color: '#f759ab' },
  { user: 'admin', action: '重置了用户「赵六」的密码', time: '3 小时前', color: '#faad14' },
  { user: 'zhangsan', action: '登录了系统', time: '5 小时前', color: '#36cfc9' },
]

/* ── 统计卡片 ── */

const statCards = [
  { title: '用户总数', value: 80, icon: <UserOutlined />, color: '#00c2ff' },
  { title: '菜单数量', value: 24, icon: <MenuOutlined />, color: '#7b61ff' },
  { title: '角色数量', value: 5, icon: <SafetyOutlined />, color: '#36cfc9' },
  { title: '今日访问', value: 750, icon: <RiseOutlined />, color: '#f759ab' },
]

/* ── 页面 ── */

function Dashboard() {
  const { token } = theme.useToken()
  const themeMode = useThemeStore((s) => s.mode)
  const chartTheme = themeMode === 'dark' ? 'classicDark' : 'classic'

  const lineConfig = {
    data: visitData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    theme: chartTheme,
    style: { lineWidth: 3, stroke: '#00c2ff' },
    area: { style: { fill: 'linear-gradient(270deg, #00c2ff22, #00c2ff08)' } },
    axis: {
      x: { label: { style: { fill: token.colorTextSecondary } } },
      y: { label: { style: { fill: token.colorTextSecondary } }, grid: true },
    },
    interaction: { tooltip: { marker: false } },
    height: 280,
  }

  const columnConfig = {
    data: moduleData,
    xField: 'module',
    yField: 'count',
    theme: chartTheme,
    style: {
      radiusEndTop: 4,
      fill: 'linear-gradient(180deg, #7b61ff, #7b61ff44)',
    },
    axis: {
      x: { label: { style: { fill: token.colorTextSecondary } } },
      y: { label: { style: { fill: token.colorTextSecondary } }, grid: true },
    },
    interaction: { tooltip: { marker: false } },
    height: 280,
  }

  const pieConfig = {
    data: roleData,
    angleField: 'value',
    colorField: 'type',
    theme: chartTheme,
    innerRadius: 0.6,
    style: { stroke: token.colorBgContainer, lineWidth: 3 },
    label: { text: 'type', style: { fill: token.colorText, fontSize: 12 } },
    legend: { color: { itemLabelFill: token.colorTextSecondary } },
    height: 280,
  }

  return (
    <div className="dashboard">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statCards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card className="stat-card" hoverable>
              <div className="stat-card-inner">
                <div className="stat-card-icon" style={{ color: item.color, background: `${item.color}18` }}>
                  {item.icon}
                </div>
                <Statistic title={item.title} value={item.value} valueStyle={{ color: item.color, fontWeight: 700 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 折线图 + 饼图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="近 7 日访问趋势" className="chart-card">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="角色分布" className="chart-card">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* 柱状图 + 活动日志 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="模块访问量 TOP 5" className="chart-card">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span><ClockCircleOutlined style={{ marginRight: 8 }} />最近操作</span>}
            className="chart-card"
          >
            {activityData.map((item, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-dot" style={{ background: item.color }} />
                <div className="activity-content">
                  <div className="activity-text">
                    <Tag bordered={false} style={{ marginRight: 6 }}>{item.user}</Tag>
                    {item.action}
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <FileUpload />
        </Col>
      </Row>

    </div>
  )
}

export default Dashboard
