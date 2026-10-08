import { useCallback, useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Tabs from '@/components/ui/Tabs'
import ProductForm from '@/components/domain/ProductForm'
import { listProductCategories } from '@/services/shop'
import CategoriesTab from './CategoriesTab'
import ProductsTab from './ProductsTab'
import styles from './AdminProducts.module.scss'

const TABS = [
  { id: 'products', label: 'Productos' },
  { id: 'categories', label: 'Categorías' },
]
const LOAD_CATEGORIES_ERROR = 'No se han podido cargar las categorías. Inténtalo de nuevo.'

export default function AdminProducts() {
  const [tab, setTab] = useState('products')
  const [categories, setCategories] = useState(null)
  const [categoriesError, setCategoriesError] = useState(null)

  const loadCategories = useCallback(
      (signal) =>
          listProductCategories({ signal })
              .then((data) => {
                setCategories(data)
                setCategoriesError(null)
              })
              .catch((apiError) => {
                if (apiError.name === 'AbortError') return
                setCategories([])
                setCategoriesError(apiError.detail ?? LOAD_CATEGORIES_ERROR)
              }),
      [],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadCategories(controller.signal)
    return () => controller.abort()
  }, [loadCategories])

  return (
      <div className={styles.root}>
        <header className={styles.intro}>
          <span className={styles.eyebrow}>Administración</span>
          <h1 className={styles.title}>Tienda</h1>
          <p className={styles.lead}>
            Da de alta productos, cambia precios y stock y organiza las categorías. Un producto
            desactivado deja de verse en la tienda, pero sus pedidos se conservan.
          </p>
        </header>

        {categoriesError && <Alert tone="warning">{categoriesError}</Alert>}

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Qué quieres gestionar">
          {tab === 'products' ? (
              <ProductsTab categories={categories ?? []} />
          ) : (
              <CategoriesTab categories={categories} onChanged={() => loadCategories()} />
          )}
        </Tabs>
      </div>
  )
}