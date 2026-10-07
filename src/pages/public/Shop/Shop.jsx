import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '@/components/domain/ProductCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import Field from '@/components/ui/Field'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import useAuth from '@/hooks/useAuth'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { PATHS } from '@/routes/paths'
import { listProductCategories, listProducts } from '@/services/shop'
import cx from '@/utils/cx'
import { eurosToCents } from '@/utils/format'
import styles from './Shop.module.scss'

const PAGE_SIZE = 12
const SEARCH_DELAY_MS = 350
const LOAD_ERROR = 'No se ha podido cargar la tienda. Inténtalo de nuevo.'
const EMPTY_FILTERS = { q: '', minPrice: '', maxPrice: '' }

export default function Shop() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState(null)
  const [form, setForm] = useState(EMPTY_FILTERS)
  const filters = useDebouncedValue(form, SEARCH_DELAY_MS)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    listProductCategories({ signal: controller.signal })
        .then(setCategories)
        .catch((apiError) => {
          if (apiError.name !== 'AbortError') setError(apiError.detail ?? LOAD_ERROR)
        })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    listProducts({
      category_id: categoryId ?? undefined,
      min_price: eurosToCents(filters.minPrice),
      max_price: eurosToCents(filters.maxPrice),
      q: filters.q.trim() || undefined,
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
  }, [categoryId, filters, page])

  const hasFilters = categoryId !== null || Boolean(form.q || form.minPrice || form.maxPrice)

  function handleCategory(id) {
    setCategoryId(id)
    setPage(1)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function handleClear() {
    setCategoryId(null)
    setForm(EMPTY_FILTERS)
    setPage(1)
  }

  function handleAdd() {
    if (!isAuthenticated) {
      navigate(PATHS.login, { state: { from: PATHS.shop } })
      return
    }
    // TODO(HU-23): add the product to the cart.
  }

  return (
      <div className={styles.root}>
        <header className={styles.header}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Tienda Brava</span>
            <h1 className={styles.title}>Tienda</h1>
            <p className={styles.lead}>
              Suplementos, ropa y accesorios para entrenar. Haz tu pedido y recógelo en el gimnasio.
            </p>
          </div>

          <div className={styles.chips} role="group" aria-label="Categoría">
            <Chip selected={categoryId === null} onClick={() => handleCategory(null)}>
              Todas
            </Chip>
            {categories.map((category) => (
                <Chip
                    key={category.id}
                    selected={categoryId === category.id}
                    onClick={() => handleCategory(category.id)}
                >
                  {category.name}
                </Chip>
            ))}
          </div>

          <form
              className={styles.filters}
              onSubmit={(event) => event.preventDefault()}
              noValidate
              role="search"
              aria-label="Filtrar productos"
          >
            <Field
                className={styles.search}
                label="Buscar"
                name="q"
                type="search"
                value={form.q}
                onChange={handleChange}
                placeholder="Camiseta, proteína…"
            />
            <Field
                label="Precio mínimo (€)"
                name="minPrice"
                inputMode="decimal"
                value={form.minPrice}
                onChange={handleChange}
            />
            <Field
                label="Precio máximo (€)"
                name="maxPrice"
                inputMode="decimal"
                value={form.maxPrice}
                onChange={handleChange}
            />
            {hasFilters && (
                <div className={styles.actions}>
                  <Button variant="quiet" onClick={handleClear}>
                    Quitar filtros
                  </Button>
                </div>
            )}
          </form>
        </header>

        {error && <Alert tone="error">{error}</Alert>}

        {!result && !error && loading && <Spinner label="Cargando productos…" />}

        {result && result.items.length === 0 && (
            <EmptyState
                title="No hay productos con estos filtros"
                text="Prueba con otra categoría u otro rango de precios."
                action={
                  hasFilters ? (
                      <Button variant="secondary" onClick={handleClear}>
                        Quitar filtros
                      </Button>
                  ) : undefined
                }
            />
        )}

        {result && result.items.length > 0 && (
            <>
              <div className={cx(styles.grid, loading && styles.isLoading)} aria-busy={loading}>
                {result.items.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={handleAdd} />
                ))}
              </div>
              <Pagination page={result.page} size={result.size} total={result.total} onChange={setPage} />
            </>
        )}
      </div>
  )
}