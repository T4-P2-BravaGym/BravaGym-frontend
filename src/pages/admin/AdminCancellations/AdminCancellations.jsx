import { useCallback, useEffect, useState } from 'react'
import CancellationRequestCard from '@/components/domain/CancellationRequestCard'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import { ApiError } from '@/services/api'
import {
  approveCancellationRequest,
  listCancellationRequests,
  rejectCancellationRequest,
} from '@/services/cancellations'
import styles from './AdminCancellations.module.scss'

/**
 * Bandeja de bajas (HU-20.4 / RN-13)
 * Admin reviews pending cancellation requests: approve (deactivates the member and
 * cancels future bookings) or reject (requires admin_notes). Uses the HU-20 API:
 * GET /cancellation-requests, POST …/approve, POST …/reject.
 */

const PAGE_SIZE = 20
const LOAD_ERROR = 'No se han podido cargar las solicitudes de baja. Inténtalo de nuevo.'
const APPROVE_SUCCESS =
  'Baja aprobada. La suscripción queda cancelada, la usuaria inactiva y sus reservas futuras canceladas.'
const REJECT_SUCCESS = 'Solicitud rechazada. La socia sigue activa y puede enviar otra.'

const STATUS_TABS = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'all', label: 'Todas' },
]

export default function AdminCancellations() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)

  const loadList = useCallback(
    (signal) => {
      setLoading(true)
      setError(null)
      return listCancellationRequests({
        status: status === 'all' ? undefined : status,
        page,
        size: PAGE_SIZE,
        signal,
      })
        .then(setResult)
        .catch((apiError) => {
          if (apiError.name === 'AbortError') return
          setResult(null)
          setError(apiError.detail ?? LOAD_ERROR)
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false)
        })
    },
    [status, page],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadList(controller.signal)
    return () => controller.abort()
  }, [loadList])

  function changeStatus(next) {
    setStatus(next)
    setPage(1)
    setFlash(null)
    setActionError(null)
  }

  function handleAskApprove(request, notes) {
    setActionError(null)
    setFlash(null)
    setApproveTarget({ request, notes })
  }

  async function handleConfirmApprove() {
    if (!approveTarget?.request?.id) return
    const { request, notes } = approveTarget
    setBusyId(request.id)
    setActionError(null)
    setFlash(null)
    try {
      await approveCancellationRequest(request.id, {
        admin_notes: notes || undefined,
      })
      setFlash(APPROVE_SUCCESS)
      setApproveTarget(null)
      await loadList()
    } catch (apiError) {
      setActionError(reviewErrorMessage(apiError, 'approve'))
      setApproveTarget(null)
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(request, notes) {
    setBusyId(request.id)
    setActionError(null)
    setFlash(null)
    try {
      await rejectCancellationRequest(request.id, { admin_notes: notes })
      setFlash(REJECT_SUCCESS)
      await loadList()
    } catch (apiError) {
      setActionError(reviewErrorMessage(apiError, 'reject'))
    } finally {
      setBusyId(null)
    }
  }

  const items = result?.items ?? []
  const emptyCopy = emptyMessage(status)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Administración</span>
        <h1 className={styles.title}>Solicitudes de baja</h1>
        <p className={styles.lead}>
          Aprueba o rechaza las bajas. Al aprobar, la suscripción se cancela, la usuaria
          queda inactiva y se cancelan sus reservas futuras.
        </p>
      </header>

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}
      {actionError && (
        <Alert tone="error" title={actionError.title} onClose={() => setActionError(null)}>
          {actionError.text}
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <Tabs tabs={STATUS_TABS} active={status} onChange={changeStatus} label="Estado de la solicitud">
        {loading ? (
          <Spinner label="Cargando solicitudes…" />
        ) : items.length === 0 ? (
          <EmptyState title={emptyCopy.title} text={emptyCopy.text} />
        ) : (
          <>
            <div className={styles.list}>
              {items.map((request) => (
                <CancellationRequestCard
                  key={request.id}
                  request={request}
                  busy={busyId === request.id}
                  onApprove={handleAskApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
            {result && (
              <div className={styles.footer}>
                <Pagination
                  page={result.page}
                  size={result.size}
                  total={result.total}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Tabs>

      <Modal
        open={Boolean(approveTarget)}
        title="¿Aprobar esta baja?"
        description="Esta acción desactiva a la socia, cancela su suscripción y anula sus reservas futuras. No se puede deshacer desde aquí."
        confirmLabel="Sí, aprobar baja"
        cancelLabel="Volver"
        tone="danger"
        busy={busyId != null && busyId === approveTarget?.request?.id}
        onConfirm={handleConfirmApprove}
        onClose={() => {
          if (busyId == null) setApproveTarget(null)
        }}
      />
    </div>
  )
}

function emptyMessage(status) {
  if (status === 'pending') {
    return {
      title: 'No hay bajas pendientes',
      text: 'Cuando una socia solicite la baja, aparecerá aquí para que la revises.',
    }
  }
  if (status === 'approved') {
    return {
      title: 'Todavía no hay bajas aprobadas',
      text: 'Las solicitudes que apruebes se listarán en esta pestaña.',
    }
  }
  if (status === 'rejected') {
    return {
      title: 'Todavía no hay bajas rechazadas',
      text: 'Las solicitudes que rechaces con notas se listarán aquí.',
    }
  }
  return {
    title: 'No hay solicitudes de baja',
    text: 'Aún no se ha enviado ninguna solicitud.',
  }
}

function reviewErrorMessage(error, action) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      return {
        title: 'Faltan las notas',
        text: error.detail ?? 'Para rechazar una baja tienes que explicar el motivo en las notas.',
      }
    }
    if (error.status === 404) {
      return {
        title: 'Solicitud no encontrada',
        text: error.detail ?? 'Esta solicitud ya no existe o no tienes permiso para verla.',
      }
    }
    if (error.status === 409) {
      return {
        title: 'No se puede revisar',
        text: error.detail ?? 'Esta solicitud ya fue revisada o ha cambiado de estado.',
      }
    }
    if (error.status === 403) {
      return {
        title: 'Sin permiso',
        text: error.detail ?? 'Solo administración puede revisar las bajas.',
      }
    }
    return {
      title: action === 'approve' ? 'No se ha podido aprobar' : 'No se ha podido rechazar',
      text: error.detail ?? 'Inténtalo de nuevo.',
    }
  }
  return {
    title: 'Error inesperado',
    text: 'Inténtalo de nuevo.',
  }
}
