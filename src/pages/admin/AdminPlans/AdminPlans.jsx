import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { createPlan, deactivatePlan, listAdminPlans, updatePlan } from '@/services/plans'
import { centsToEurosInput, eurosToCents } from '@/utils/format'
import styles from './AdminPlans.module.scss'

const COLUMNS = [
  { key: 'name', header: 'Plan' },
  { key: 'monthly_price_formatted', header: 'Cuota mensual', align: 'right' },
  { key: 'is_active', header: 'Estado', render: (plan) => (
    <Badge tone={plan.is_active ? 'success' : 'neutral'}>{plan.is_active ? 'Activo' : 'Desactivado'}</Badge>
  ) },
  {
    key: 'includes_personal_training',
    header: 'Entrenamiento personal',
    render: (plan) => (plan.includes_personal_training ? 'Incluido' : 'No incluido'),
  },
]

export default function AdminPlans() {
  const [plans, setPlans] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', personalTraining: false })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

    listAdminPlans({ page })
      .then((data) => {
        if (!cancelled) setPlans(data)
      })
      .catch((apiError) => {
        if (!cancelled) {
          setError(apiError.detail ?? 'No se han podido cargar los planes.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey, page])

  function openForm(plan = null) {
    setEditing(plan)
    setForm({
      name: plan?.name ?? '',
      description: plan?.description ?? '',
      price: centsToEurosInput(plan?.monthly_price_cents),
      personalTraining: plan?.includes_personal_training ?? false,
    })
    setFormError(null)
    setSuccess(null)
    setActionError(null)
    setFormOpen(true)
  }

  function updateField(name) {
    return (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const body = {
        name: form.name,
        description: form.description.trim() ? form.description : null,
        monthly_price_cents: eurosToCents(form.price),
        includes_personal_training: form.personalTraining,
      }
      const saved = editing ? await updatePlan(editing.id, body) : await createPlan(body)
      setSuccess(editing ? `«${saved.name}» actualizado.` : `«${saved.name}» creado.`)
      setFormOpen(false)
      setReloadKey((key) => key + 1)
    } catch (apiError) {
      setFormError(apiError.status === 422
        ? 'Revisa los datos: nombre de 1 a 80 caracteres, descripción de hasta 2000 y precio válido no negativo.'
        : apiError.detail ?? 'No se ha podido guardar el plan. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget || busy) return
    setBusy(true)
    setActionError(null)
    setSuccess(null)
    try {
      const saved = await deactivatePlan(deactivateTarget.id)
      setSuccess(`«${saved.name}» desactivado. Ya no aparece en precios.`)
      setDeactivateTarget(null)
      setReloadKey((key) => key + 1)
    } catch (apiError) {
      setActionError(apiError.detail ?? 'No se ha podido desactivar el plan. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    ...COLUMNS,
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (plan) => (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => openForm(plan)} disabled={busy || formOpen} aria-label={`Editar ${plan.name}`}>
            Editar
          </Button>
          {plan.is_active && <Button variant="secondary" size="sm" onClick={() => { setActionError(null); setDeactivateTarget(plan) }} disabled={busy || formOpen} aria-label={`Desactivar ${plan.name}`}>
            Desactivar
          </Button>}
        </div>
      ),
    },
  ]

  return (
    <div className={styles.root}>
      <header>
        <h1>Planes</h1>
        <p>Gestiona los planes activos y desactivados. Solo los activos aparecen en precios.</p>
      </header>

      <div>
        <Button onClick={() => openForm()} disabled={formOpen}>Nuevo plan</Button>
      </div>
      {success && <Alert tone="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {formOpen && (
        <section className={styles.formSection} aria-labelledby="new-plan-title">
          <h2 id="new-plan-title">{editing ? `Editar «${editing.name}»` : 'Nuevo plan'}</h2>
          {formError && <Alert tone="error">{formError}</Alert>}
          <form className={styles.form} onSubmit={handleSave} noValidate>
            <Field label="Nombre" name="name" value={form.name} onChange={updateField('name')} disabled={busy} />
            <Field label="Cuota mensual (€)" name="price" inputMode="decimal" hint="Por ejemplo, 45,90" value={form.price} onChange={updateField('price')} disabled={busy} />
            <Field label="Descripción (opcional)" as="textarea" name="description" rows={3} value={form.description} onChange={updateField('description')} disabled={busy} />
            <label className={styles.checkbox}>
              <input type="checkbox" name="personalTraining" checked={form.personalTraining} disabled={busy} onChange={(event) => setForm((current) => ({ ...current, personalTraining: event.target.checked }))} />
              Incluye entrenamiento personal
            </label>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={busy}>Cancelar</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear plan'}</Button>
            </div>
          </form>
        </section>
      )}

      {error && <Alert tone="error">{error}</Alert>}
      {!plans && !error && <Spinner label="Cargando planes…" />}

      {plans && (
        <>
        <Table
          caption="Planes del gimnasio"
          columns={columns}
          rows={plans.items}
          emptyTitle="No hay planes"
        />
        <Pagination page={plans.page} size={plans.size} total={plans.total} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(deactivateTarget)}
        title="¿Desactivar este plan?"
        description={deactivateTarget ? `«${deactivateTarget.name}» dejará de aparecer en precios. Las suscripciones existentes se conservan sin cambios.` : undefined}
        confirmLabel="Desactivar"
        tone="danger"
        busy={busy}
        onConfirm={handleDeactivate}
        onClose={() => { if (!busy) setDeactivateTarget(null) }}
      >
        {actionError && <Alert tone="error">{actionError}</Alert>}
      </Modal>
    </div>
  )
}
