import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import NetScreen from './components/NetScreen'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Savings from './pages/Savings'
import Users from './pages/admin/Users'
import RecycleBin from './pages/admin/RecycleBin'
import AllData from './pages/admin/AllData'
import AuditLog from './pages/admin/AuditLog'

function Protected({ children }) {
  const { session, loading, netError } = useAuth()
  if (netError) return <NetScreen />
  if (loading) return <div className="splash">Karti…</div>
  return session ? children : <Navigate to="/login" replace />
}
function AdminOnly({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/" replace />
}
function Guest({ children }) {
  const { session, loading, netError } = useAuth()
  if (netError) return <NetScreen />
  if (loading) return <div className="splash">Karti…</div>
  return session ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route path="/register" element={<Guest><Register /></Guest>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/savings" element={<Protected><Savings /></Protected>} />
      <Route path="/admin/users" element={<Protected><AdminOnly><Users /></AdminOnly></Protected>} />
      <Route path="/admin/data" element={<Protected><AdminOnly><AllData /></AdminOnly></Protected>} />
      <Route path="/admin/audit" element={<Protected><AdminOnly><AuditLog /></AdminOnly></Protected>} />
      <Route path="/admin/recycle" element={<Protected><AdminOnly><RecycleBin /></AdminOnly></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
