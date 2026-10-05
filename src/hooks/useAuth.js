import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

/** Access the session from any component: const { user, login, logout } = useAuth() */
export default function useAuth() {
  return useContext(AuthContext)
}
