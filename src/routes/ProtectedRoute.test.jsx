import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import AdminDashboard from '@/pages/admin/AdminDashboard'
vi.mock('@/hooks/useAuth', () => ({ default: () => ({ user: null, isLoading: false }) }))
function Destination() {
  const location = useLocation()
  return <p>{location.state?.from ?? location.pathname}</p>
}
it('preserves a Stripe return query and fragment through login', () => {
  render(<MemoryRouter initialEntries={['/mi-area/pagos?stripe=success#status']}><Routes>
    <Route element={<ProtectedRoute />}><Route path="/mi-area/pagos" element={<p>Private</p>} /></Route>
    <Route path="/entrar" element={<Destination />} />
  </Routes></MemoryRouter>)
  expect(screen.getByText('/mi-area/pagos?stripe=success#status')).toBeInTheDocument()
})
it('lands administrators on an operational page', () => {
  render(<MemoryRouter initialEntries={['/admin']}><Routes>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/pagos" element={<Destination />} />
  </Routes></MemoryRouter>)
  expect(screen.getByText('/admin/pagos')).toBeInTheDocument()
})
