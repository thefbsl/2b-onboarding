import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Button, Layout, Space, Tag, Typography } from 'antd'
import './App.css'
import Login from './pages/Login'
import CandidateDashboard from './pages/CandidateDashboard'
import HrDashboard from './pages/HrDashboard'
import ItDashboard from './pages/ItDashboard'
import FinanceDashboard from './pages/FinanceDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './store/authStore'

const { Header, Content } = Layout
const { Text } = Typography

const roleToRoute = {
  candidate: '/candidate',
  hr: '/hr',
  it: '/it',
  finance: '/finance',
  admin: '/admin',
}

const AppShell = ({ children }) => {
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const isLogin = location.pathname === '/login'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout className="app-layout">
      {!isLogin && (
        <Header className="app-header">
          <div className="header-title">
            <Text strong>EQ-Onboarding</Text>
            {role && <Tag color="blue">{role.toUpperCase()}</Tag>}
          </div>
          {role && (
            <Space>
              <Button onClick={() => navigate(roleToRoute[role])}>Dashboard</Button>
              <Button onClick={handleLogout}>Logout</Button>
            </Space>
          )}
        </Header>
      )}
      <Content className="app-content">{children}</Content>
    </Layout>
  )
}

const AppRoutes = () => {
  const role = useAuthStore((state) => state.role)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
        <Route path="/candidate" element={<CandidateDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
        <Route path="/hr" element={<HrDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['it']} />}>
        <Route path="/it" element={<ItDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['finance']} />}>
        <Route path="/finance" element={<FinanceDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/" element={<Navigate to={role ? roleToRoute[role] : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  )
}

export default App
