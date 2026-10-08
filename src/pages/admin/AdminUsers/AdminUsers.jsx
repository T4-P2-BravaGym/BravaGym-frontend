import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Field from '@/components/ui/Field'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { ROLE_LABELS } from '@/routes/navigation'
import { listUsers } from '@/services/users'
import styles from './AdminUsers.module.scss'

/**
 * Usuarias y roles (HU-06)
 * Admins search users by name or email and filter by role and status.
 * TODO(HU-05): change the role from this table.
 */
const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 350
const LOAD_ERROR = 'No se han podido cargar las usuarias. Inténtalo de nuevo.'

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
  }, [role, isActive, q, page])

  // Any filter change goes back to page 1, or she could land on an empty page
  function changeFilter(setter) {
    return (event) => {
      setter(event.target.value)
      setPage(1)
    }
  }

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

      {error && <Alert tone="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Cargando usuarias…" />
      ) : (
        result && (
          <>
            <Table
              caption="Usuarias registradas"
              columns={COLUMNS}
              rows={result.items}
              emptyTitle="No hay usuarias con estos filtros"
              emptyText="Prueba con otro nombre o quita algún filtro."
            />
            <Pagination page={result.page} size={result.size} total={result.total} onChange={setPage} />
          </>
        )
      )}
    </div>
  )
}