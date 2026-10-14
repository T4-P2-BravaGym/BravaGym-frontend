import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import useAuth from '@/hooks/useAuth'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { ROLE_LABELS } from '@/routes/navigation'
import { changeRole, deactivateUser, getUser, listUsers, updateUser } from '@/services/users'
import { canManage, roleChoices } from './canManage'
import UserPanel from './UserPanel'
import styles from './AdminUsers.module.scss'

/**
 * Usuarias y roles (HU-05, HU-06, HU-31)
 * Admins search users by name or email and filter by role and status.
 * HU-05: change the role from the table, after a confirmation.
 * HU-31: view, edit and deactivate a user from the table.
 */
const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 350
const LOAD_ERROR = 'No se han podido cargar las usuarias. Inténtalo de nuevo.'
const SAVE_ERROR = 'No se ha podido guardar. Inténtalo de nuevo.'

// Status filter: the select works with strings, the API expects true/false
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Desactivadas' },
]

// Columns for the Table component: header text and how to draw each cell
const COLUMNS = [
  { key: 'name', header: 'Nombre', render: (user) => `${user.first_name} ${user.last_name}` },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Teléfono', render: (user) => user.phone ?? '—' },
  { key: 'role', header: 'Rol', render: (user) => ROLE_LABELS[user.role] ?? user.role },
  {
    key: 'is_active',
    header: 'Estado',
    render: (user) =>
      user.is_active ? <Badge status="active" /> : <Badge tone="neutral">Desactivada</Badge>,
  },
]

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search, SEARCH_DELAY_MS) // wait until she stops typing
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // HU-31: the user open in the panel, and the deactivation waiting for confirmation
  const { user: me } = useAuth()
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('view')
  const [panelError, setPanelError] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [roleChange, setRoleChange] = useState(null) // HU-05: { user, role } waiting for confirmation
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Reload whenever a filter or the page changes
  useEffect(() => {
    const controller = new AbortController() // cancels the old request if filters change fast
    setLoading(true)
    setError(null)

    listUsers({
      role: role || undefined,
      is_active: isActive || undefined,
      q: q.trim() || undefined,
      page,
      size: PAGE_SIZE,
      signal: controller.signal,
    })
      .then(setResult)
      .catch((apiError) => {
        if (apiError.name === 'AbortError') return
        setResult(null)
        setError(apiError.detail ?? LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [role, isActive, q, page, reloadKey])

  // Any filter change goes back to page 1, or she could land on an empty page
  function changeFilter(setter) {
    return (event) => {
      setter(event.target.value)
      setPage(1)
    }
  }

  function clearMessages() {
    setFlash(null)
    setActionError(null)
    setPanelError(null)
  }

  // "Ver" and "Editar" load her latest data first (GET /users/{id})
  async function openPanel(user, nextMode) {
    clearMessages()
    try {
      setSelected(await getUser(user.id))
      setMode(nextMode)
    } catch (apiError) {
      setActionError(apiError.detail ?? LOAD_ERROR)
    }
  }

  function closePanel() {
    setSelected(null)
    setPanelError(null)
  }

  async function handleSave(changes) {
    clearMessages()
    setBusy(true)
    try {
      const saved = await updateUser(selected.id, changes)
      setSelected(saved)
      setMode('view')
      setFlash(`Datos de ${saved.first_name} guardados.`)
      setReloadKey((key) => key + 1)
    } catch (apiError) {
      setPanelError({ title: 'Revisa los datos', text: apiError.detail ?? SAVE_ERROR })
    } finally {
      setBusy(false)
    }
  }

  async function handleDeactivate() {
    clearMessages()
    setBusy(true)
    try {
      await deactivateUser(deactivateTarget.id)
      setFlash(`${deactivateTarget.first_name} ${deactivateTarget.last_name} ya no puede entrar en Brava.`)
      if (selected?.id === deactivateTarget.id) closePanel()
      setReloadKey((key) => key + 1)
    } catch (apiError) {
      setActionError(apiError.detail ?? SAVE_ERROR)
    } finally {
      setDeactivateTarget(null)
      setBusy(false)
    }
  }

  async function handleRoleChange() {
    clearMessages()
    setBusy(true)
    const { user, role: newRole } = roleChange
    try {
      await changeRole(user.id, newRole)
      setFlash(`${user.first_name} ${user.last_name} ahora es ${ROLE_LABELS[newRole]}.`)
      if (selected?.id === user.id) closePanel()
      setReloadKey((key) => key + 1)
    } catch (apiError) {
      setActionError(apiError.detail ?? SAVE_ERROR)
    } finally {
      setRoleChange(null)
      setBusy(false)
    }
  }

  // HU-05: a select in the "Rol" column when she can manage that user (not herself, only active users)
  function renderRole(user) {
    const label = ROLE_LABELS[user.role] ?? user.role
    if (!canManage(me, user) || user.id === me?.id || !user.is_active) return label
    return (
      <select
        className={styles.roleSelect}
        aria-label={`Rol de ${user.first_name} ${user.last_name}`}
        value={user.role}
        disabled={busy}
        onChange={(event) => setRoleChange({ user, role: event.target.value })}
      >
        {roleChoices(me).map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
    )
  }

  const columns = [
    ...COLUMNS.map((column) => (column.key === 'role' ? { ...column, render: renderRole } : column)),
    {
      key: 'actions',
      header: <span className={styles.actionsHeader}>Acciones</span>,
      render: (user) => (
        <div className={styles.rowActions}>
          <Button variant="secondary" size="sm" onClick={() => openPanel(user, 'view')} disabled={busy}>
            Ver
          </Button>
          {canManage(me, user) ? (
            user.is_active && (
              <>
                <Button variant="secondary" size="sm" onClick={() => openPanel(user, 'edit')} disabled={busy}>
                  Editar
                </Button>
                {user.id !== me?.id && (
                  <Button variant="danger" size="sm" onClick={() => setDeactivateTarget(user)} disabled={busy}>
                    Dar de baja
                  </Button>
                )}
              </>
            )
          ) : (
            <span className={styles.locked}>Solo superadmin</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Administración</span>
        <h1 className={styles.title}>Usuarias y roles</h1>
        <p className={styles.lead}>Busca socias, entrenadoras y personal de administración.</p>
      </header>

      <div className={styles.filters}>
        <Field
          label="Buscar"
          type="search"
          value={search}
          maxLength={60}
          placeholder="Nombre, apellido o email"
          onChange={changeFilter(setSearch)}
        />
        <Field label="Rol" as="select" value={role} onChange={changeFilter(setRole)}>
          <option value="">Todos los roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Field>
        <Field label="Estado" as="select" value={isActive} onChange={changeFilter(setIsActive)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
      </div>

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      )}
      {actionError && (
        <Alert tone="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {selected && (
        <UserPanel
          key={`${selected.id}-${mode}`}
          user={selected}
          mode={mode}
          canEdit={canManage(me, selected) && selected.is_active}
          busy={busy}
          error={panelError}
          onEdit={() => setMode('edit')}
          onSave={handleSave}
          onClose={closePanel}
        />
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Cargando usuarias…" />
      ) : (
        result && (
          <>
            <Table
              caption="Usuarias registradas"
              columns={columns}
              rows={result.items}
              emptyTitle="No hay usuarias con estos filtros"
              emptyText="Prueba con otro nombre o quita algún filtro."
            />
            <Pagination page={result.page} size={result.size} total={result.total} onChange={setPage} />
          </>
        )
      )}

      <Modal
        open={Boolean(deactivateTarget)}
        title="¿Dar de baja a esta usuaria?"
        description={
          deactivateTarget
            ? `${deactivateTarget.first_name} ${deactivateTarget.last_name} no podrá entrar en Brava. Se cancelan su suscripción activa y sus reservas futuras. Sus datos y sus pagos se conservan.`
            : undefined
        }
        confirmLabel="Dar de baja"
        tone="danger"
        busy={busy}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivateTarget(null)}
      />

      <Modal
        open={Boolean(roleChange)}
        title="¿Cambiar el rol?"
        description={
          roleChange
            ? `${roleChange.user.first_name} ${roleChange.user.last_name} pasará de ${ROLE_LABELS[roleChange.user.role]} a ${ROLE_LABELS[roleChange.role]}.`
            : undefined
        }
        confirmLabel="Cambiar rol"
        busy={busy}
        onConfirm={handleRoleChange}
        onClose={() => setRoleChange(null)}
      />
    </div>
  )
}

