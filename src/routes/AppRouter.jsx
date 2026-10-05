import { Route, Routes } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import PrivateLayout from '@/layouts/PrivateLayout'
import ProtectedRoute from './ProtectedRoute'
import { PATHS } from './paths'
import Sandbox from '@/pages/dev/Sandbox'
import Home from '@/pages/public/Home'
import Schedule from '@/pages/public/Schedule'
import Trainers from '@/pages/public/Trainers'
import Pricing from '@/pages/public/Pricing'
import Shop from '@/pages/public/Shop'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import NotFound from '@/pages/public/NotFound'
import MemberHome from '@/pages/member/MemberHome'
import Bookings from '@/pages/member/Bookings'
import PersonalTraining from '@/pages/member/PersonalTraining'
import MyRoutine from '@/pages/member/MyRoutine'
import MyPayments from '@/pages/member/MyPayments'
import Cart from '@/pages/member/Cart'
import Profile from '@/pages/member/Profile'
import TrainerSessions from '@/pages/trainer/TrainerSessions'
import TrainerSlots from '@/pages/trainer/TrainerSlots'
import TrainerRoutines from '@/pages/trainer/TrainerRoutines'
import TrainerProfile from '@/pages/trainer/TrainerProfile'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminCancellations from '@/pages/admin/AdminCancellations'
import AdminDiscountCodes from '@/pages/admin/AdminDiscountCodes'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminPlans from '@/pages/admin/AdminPlans'
import AdminProducts from '@/pages/admin/AdminProducts'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={PATHS.home} element={<Home />} />
        <Route path={PATHS.schedule} element={<Schedule />} />
        <Route path={PATHS.trainers} element={<Trainers />} />
        <Route path={PATHS.pricing} element={<Pricing />} />
        <Route path={PATHS.shop} element={<Shop />} />
        <Route path={PATHS.login} element={<Login />} />
        <Route path={PATHS.register} element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute roles={['member']} />}>
        <Route element={<PrivateLayout />}>
          <Route path={PATHS.member} element={<MemberHome />} />
          <Route path={PATHS.bookings} element={<Bookings />} />
          <Route path={PATHS.personalTraining} element={<PersonalTraining />} />
          <Route path={PATHS.myRoutine} element={<MyRoutine />} />
          <Route path={PATHS.myPayments} element={<MyPayments />} />
          <Route path={PATHS.cart} element={<Cart />} />
          <Route path={PATHS.profile} element={<Profile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['trainer', 'superadmin']} />}>
        <Route element={<PrivateLayout />}>
          <Route path={PATHS.trainerSessions} element={<TrainerSessions />} />
          <Route path={PATHS.trainerSlots} element={<TrainerSlots />} />
          <Route path={PATHS.trainerRoutines} element={<TrainerRoutines />} />
          <Route path={PATHS.trainerProfile} element={<TrainerProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}>
        <Route element={<PrivateLayout />}>
          <Route path={PATHS.admin} element={<AdminDashboard />} />
          <Route path={PATHS.adminPayments} element={<AdminPayments />} />
          <Route path={PATHS.adminCancellations} element={<AdminCancellations />} />
          <Route path={PATHS.adminDiscountCodes} element={<AdminDiscountCodes />} />
          <Route path={PATHS.adminUsers} element={<AdminUsers />} />
          <Route path={PATHS.adminPlans} element={<AdminPlans />} />
          <Route path={PATHS.adminProducts} element={<AdminProducts />} />
        </Route>
      </Route>

      <Route path={PATHS.sandbox} element={<Sandbox />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
