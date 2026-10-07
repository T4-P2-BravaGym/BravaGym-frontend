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
import styles from './Shop.module.scss'

const PAGE_SIZE = 12
const SEARCH_DELAY_MS = 350
const LOAD_ERROR = 'No se ha podido cargar la tienda. Inténtalo de nuevo.'

const PRICE_RANGES = [
  { id: 'under-10', label: 'Menos de 10 €', max_price: 999 },
  { id: '10-30', label: 'De 10 a 30 €', min_price: 1000, max_price: 2999 },
  { id: 'over-30', label: '30 € o más', min_price: 3000 },
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'price_asc', label: 'Precio: de menor a mayor' },
  { value: 'price_desc', label: 'Precio: de mayor a menor' },
]
const DEFAULT_SORT = 'name'

export default function Shop() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState(null)
  const [priceRangeId, setPriceRangeId] = useState(null)
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search, SEARCH_DELAY_MS)
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
    const range = PRICE_RANGES.find((item) => item.id === priceRangeId)
    setLoading(true)
    setError(null)

    listProducts({
      category_id: categoryId ?? undefined,
      min_price: range?.min_price,
      max_price: range?.max_price,
      q: q.trim() || undefined,
      sort,
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
  }, [categoryId, priceRangeId, sort, q, page])

  const hasFilters = categoryId !== null || priceRangeId !== null || search !== ''

  function changeFilter(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }
  const handleCategory = changeFilter(setCategoryId)
  const handlePriceRange = changeFilter(setPriceRangeId)
  const handleSort = changeFilter(setSort)
  const handleSearch = changeFilter(setSearch)

  function handleClear() {
    setCategoryId(null)
    setPriceRangeId(null)
    setSearch('')
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

          <form
              className={styles.toolbar}
              onSubmit={(event) => event.preventDefault()}
              noValidate
              role="search"
              aria-label="Filtrar productos"
          >
            <Field
                className={styles.search}
                label="Buscar"
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Camiseta, proteína…"
            />
            <Field
                className={styles.sort}
                as="select"
                label="Ordenar por"
                value={sort}
                onChange={(event) => handleSort(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </Field>
          </form>

          <div className={styles.filterGroups}>
            <div className={styles.filterGroup}>
              <p className={styles.groupLabel} id="shop-category-label">
                Categoría
              </p>
              <div className={styles.chips} role="group" aria-labelledby="shop-category-label">
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
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.groupLabel} id="shop-price-label">
                Precio
              </p>
              <div className={styles.chips} role="group" aria-labelledby="shop-price-label">
                <Chip selected={priceRangeId === null} onClick={() => handlePriceRange(null)}>
                  Todos los precios
                </Chip>
                {PRICE_RANGES.map((range) => (
                    <Chip
                        key={range.id}
                        selected={priceRangeId === range.id}
                        onClick={() => handlePriceRange(range.id)}
                    >
                      {range.label}
                    </Chip>
                ))}
              </div>
            </div>

            {hasFilters && (
                <Button className={styles.clear} variant="secondary" size="sm" onClick={handleClear}>
                  Quitar filtros
                </Button>
            )}
          </div>
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