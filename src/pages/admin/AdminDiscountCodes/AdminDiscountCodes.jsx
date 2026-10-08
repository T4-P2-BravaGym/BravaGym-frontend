/**
 * Ofertas y códigos (HU-25): list, create and deactivate discount codes.
 */
import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { adminErrorMessage } from '@/pages/admin/AdminProducts/errors'
import { createCode, deactivateCode, listCodes, updateCode } from '@/services/discountCodes'
import { formatDate } from '@/utils/format'
import { codeStatus } from './codeStatus'
import DiscountCodeForm from './DiscountCodeForm'
import styles from './AdminDiscountCodes.module.scss'

const PAGE_SIZE = 20
const LOAD_ERROR = 'No se han podido cargar los códigos. Inténtalo de nuevo.'
const SAVE_ERROR = 'No se ha podido guardar el código. Inténtalo de nuevo.'
const FORM_HINT =
  'Revisa el formulario: el código tiene de 3 a 30 caracteres, el descuento va de 1 a 100 ' +
  'y las dos fechas son obligatorias.'

export default function AdminDiscountCodes() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    listCodes({ page, size: PAGE_SIZE, signal: controller.signal })
      .then(setResult)
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setResult(null)
        setLoadError(apiError.detail ?? LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, reloadKey])

  function reload() {
    setReloadKey((key) => key + 1)
  }

  function clearMessages() {
    setFlash(null)
    setFormError(null)
    setActionError(null)
  }

  // Returns true when the code was created, so the form can empty itself
  async function handleCreate(body) {
    clearMessages()
    setBusy(true)
    try {
      const created = await createCode(body)
      setFlash(`Código «${created.code}» creado.`)
      reload()
      return true
    } catch (error) {
      setFormError(adminErrorMessage(error, { fallback: SAVE_ERROR, invalidHint: FORM_HINT }))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleDeactivate() {
    clearMessages()
    setBusy(true)
    try {
      await deactivateCode(deactivateTarget.id)
      setFlash(`El código «${deactivateTarget.code}» ya no se puede usar.`)
      reload()
    } catch (error) {
      setActionError(adminErrorMessage(error, { fallback: SAVE_ERROR }))
    } finally {
      setDeactivateTarget(null)
      setBusy(false)
    }
  }

  async function handleReactivate(code) {
    clearMessages()
    setBusy(true)
    try {
      await updateCode(code.id, { is_active: true })
      setFlash(`El código «${code.code}» vuelve a estar activo.`)
      reload()
    } catch (error) {
      setActionError(adminErrorMessage(error, { fallback: SAVE_ERROR }))
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'code', header: 'Código', render: (code) => <span className={styles.code}>{code.code}</span> },
    { key: 'percent_off', header: 'Descuento', align: 'right', render: (code) => `${code.percent_off} %` },
    {
      key: 'dates',
      header: 'Validez',
      render: (code) => `${formatDate(code.valid_from)} – ${formatDate(code.valid_until)}`,
    },
    {
      key: 'uses',
      header: 'Usos',
      align: 'right',
      render: (code) => (code.max_uses === null ? `${code.uses} · sin límite` : `${code.uses} de ${code.max_uses}`),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (code) => {
        const status = codeStatus(code)
        return <Badge tone={status.tone}>{status.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (code) =>
        code.is_active ? (
          <Button variant="secondary" size="sm" onClick={() => setDeactivateTarget(code)} disabled={busy}>
            Desactivar
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => handleReactivate(code)} disabled={busy}>
            Reactivar
          </Button>
        ),
    },
  ]

  return (
    <div className={styles.root}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>Administración</span>
        <h1 className={styles.title}>Ofertas y códigos</h1>
        <p className={styles.lead}>
          Crea códigos de descuento para cuotas, clases y pedidos. Un código desactivado deja de valer, pero los
          pagos que ya lo usaron no cambian.
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

      <DiscountCodeForm busy={busy} error={formError} onSubmit={handleCreate} />

      {loadError && <Alert tone="error">{loadError}</Alert>}
      {loading && !result && <Spinner label="Cargando códigos…" />}

      {result && (
        <>
          <Table
            caption="Códigos de descuento"
            columns={columns}
            rows={result.items}
            emptyTitle="Aún no hay códigos"
            emptyText="Crea el primero con el formulario de arriba."
          />
          <Pagination page={result.page} size={result.size} total={result.total} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(deactivateTarget)}
        title="¿Desactivar este código?"
        description={
          deactivateTarget
            ? `«${deactivateTarget.code}» dejará de valer para nuevos pagos. Los pagos que ya lo usaron no cambian y puedes reactivarlo cuando quieras.`
            : undefined
        }
        confirmLabel="Desactivar"
        tone="danger"
        busy={busy}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
