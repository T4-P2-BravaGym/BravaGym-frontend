import { Navigate } from 'react-router-dom'
import { PATHS } from '@/routes/paths'

// Until the summary exists, land on the operational payments screen.
export default function AdminDashboard() {
  return <Navigate to={PATHS.adminPayments} replace />
}
