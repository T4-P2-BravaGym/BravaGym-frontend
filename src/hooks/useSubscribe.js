import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { PATHS } from '@/routes/paths'
import * as subscriptionsService from '@/services/subscriptions'

const FALLBACK_ERROR = 'No se ha podido contratar el plan. Inténtalo de nuevo.'
const MEMBERS_ONLY = 'Solo las socias pueden contratar un plan.'

export default function useSubscribe() {
    const { isAuthenticated, role } = useAuth()
    const navigate = useNavigate()
    const isMember = isAuthenticated && role === 'member'
    const [currentPlanId, setCurrentPlanId] = useState(null)
    const [pendingPlanId, setPendingPlanId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!isMember) return undefined
        const controller = new AbortController()
        subscriptionsService
            .getMySubscriptions({ signal: controller.signal })
            .then((data) => setCurrentPlanId(data.current?.plan.id ?? null))
            .catch(() => {
            })
        return () => controller.abort()
    }, [isMember])

    const subscribe = useCallback(
        async (plan) => {
            if (pendingPlanId) return
            if (!isAuthenticated) {
                navigate(PATHS.login, { state: { from: PATHS.pricing } })
                return
            }
            if (!isMember) {
                setError(MEMBERS_ONLY)
                return
            }
            setError(null)
            setPendingPlanId(plan.id)
            try {
                await subscriptionsService.subscribe(plan.id)
                navigate(PATHS.member, {
                    state: {
                        flash: `¡Bienvenida a Brava! Ya tienes el plan ${plan.name}. Tu primera cuota está pendiente en Mis pagos.`,
                    },
                })
            } catch (apiError) {
                setError(apiError.detail ?? FALLBACK_ERROR)
                setPendingPlanId(null)
            }
        },
        [pendingPlanId, isAuthenticated, isMember, navigate],
    )

    const clearError = useCallback(() => setError(null), [])

    return { subscribe, currentPlanId: isMember ? currentPlanId : null, pendingPlanId, error, clearError }
}