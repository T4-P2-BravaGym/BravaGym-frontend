import { useEffect, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import { createProduct, deactivateProduct, listAdminProducts, updateProduct } from '@/services/shop'
import { formatEuros } from '@/utils/format'
import { adminErrorMessage } from './errors'
import ProductForm from '../../../components/domain/ProductForm/ProductForm.jsx'
import styles from './AdminProducts.module.scss'

const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 350
const LOAD_ERROR = 'No se han podido cargar los productos. Inténtalo de nuevo.'
const SAVE_ERROR = 'No se ha podido guardar el producto. Inténtalo de nuevo.'
const PRODUCT_HINT =
    'Revisa el formulario: el nombre y la categoría son obligatorios, el precio va en euros ' +
    '(por ejemplo 34,90) y ni el precio ni el stock pueden ser negativos.'

export default function ProductsTab({ categories }) {
    const [search, setSearch] = useState('')
    const q = useDebouncedValue(search, SEARCH_DELAY_MS)
    const [categoryId, setCategoryId] = useState('')
    const [page, setPage] = useState(1)
    const [reloadKey, setReloadKey] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)

    const [editing, setEditing] = useState(undefined)
    const [formError, setFormError] = useState(null)
    const [deactivateTarget, setDeactivateTarget] = useState(null)
    const [busy, setBusy] = useState(false)
    const [flash, setFlash] = useState(null)
    const [actionError, setActionError] = useState(null)

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        setLoadError(null)

        listAdminProducts({
            category_id: categoryId || undefined,
            q: q.trim() || undefined,
            page,
            size: PAGE_SIZE,
            signal: controller.signal,
        })
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
    }, [categoryId, q, page, reloadKey])

    const formOpen = editing !== undefined
    const hasFilters = Boolean(categoryId || q.trim())

    function reload() {
        setReloadKey((key) => key + 1)
    }

    function clearMessages() {
        setFlash(null)
        setActionError(null)
        setFormError(null)
    }

    function openForm(product) {
        clearMessages()
        setEditing(product)
    }

    function closeForm() {
        setEditing(undefined)
        setFormError(null)
    }

    async function handleSave(body) {
        clearMessages()
        setBusy(true)
        try {
            const saved = editing ? await updateProduct(editing.id, body) : await createProduct(body)
            setFlash(editing ? `«${saved.name}» actualizado.` : `«${saved.name}» creado.`)
            closeForm()
            reload()
        } catch (error) {
            setFormError(adminErrorMessage(error, { fallback: SAVE_ERROR, invalidHint: PRODUCT_HINT }))
        } finally {
            setBusy(false)
        }
    }

    async function handleDeactivate() {
        clearMessages()
        setBusy(true)
        try {
            const saved = await deactivateProduct(deactivateTarget.id)
            setFlash(`«${saved.name}» ya no aparece en la tienda.`)
            reload()
        } catch (error) {
            setActionError(adminErrorMessage(error, { fallback: SAVE_ERROR }))
        } finally {
            setDeactivateTarget(null)
            setBusy(false)
        }
    }

    async function handleReactivate(product) {
        clearMessages()
        setBusy(true)
        try {
            const saved = await updateProduct(product.id, { is_active: true })
            setFlash(`«${saved.name}» vuelve a estar en la tienda.`)
            reload()
        } catch (error) {
            setActionError(adminErrorMessage(error, { fallback: SAVE_ERROR }))
        } finally {
            setBusy(false)
        }
    }

    const columns = [
        { key: 'name', header: 'Producto', render: (product) => <span className={styles.cellName}>{product.name}</span> },
        { key: 'category_name', header: 'Categoría' },
        { key: 'price_cents', header: 'Precio', align: 'right', render: (product) => formatEuros(product.price_cents) },
        {
            key: 'stock',
            header: 'Stock',
            align: 'right',
            render: (product) => (product.in_stock ? product.stock : <Badge tone="wait">Agotado</Badge>),
        },
        {
            key: 'is_active',
            header: 'Estado',
            render: (product) => (
                <Badge tone={product.is_active ? 'success' : 'neutral'}>{product.is_active ? 'Activo' : 'Desactivado'}</Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'right',
            render: (product) => (
                <div className={styles.rowActions}>
                    <Button variant="secondary" size="sm" onClick={() => openForm(product)} disabled={busy || formOpen}>
                        Editar
                    </Button>
                    {product.is_active ? (
                        <Button variant="secondary" size="sm" onClick={() => setDeactivateTarget(product)} disabled={busy}>
                            Desactivar
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleReactivate(product)} disabled={busy}>
                            Reactivar
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className={styles.tab}>
            <div className={styles.toolbar}>
                <Field
                    label="Buscar por nombre"
                    type="search"
                    value={search}
                    maxLength={60}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                    }}
                />
                <Field
                    label="Categoría"
                    as="select"
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(event.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">Todas</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </Field>
                <Button onClick={() => openForm(null)} disabled={formOpen || categories.length === 0}>
                    {categories.length === 0 ? 'Crea antes una categoría' : 'Nuevo producto'}
                </Button>
            </div>

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

            {formOpen && (
                <ProductForm
                    key={editing?.id ?? 'new'}
                    product={editing}
                    categories={categories}
                    busy={busy}
                    error={formError}
                    onSubmit={handleSave}
                    onCancel={closeForm}
                />
            )}

            {loadError && <Alert tone="error">{loadError}</Alert>}
            {loading && !result && <Spinner label="Cargando productos…" />}

            {result && (
                <>
                    <Table
                        caption="Productos de la tienda"
                        columns={columns}
                        rows={result.items}
                        emptyTitle={hasFilters ? 'No hay productos con estos filtros' : 'Aún no hay productos'}
                        emptyText={hasFilters ? 'Prueba con otra búsqueda o con otra categoría.' : 'Crea el primero con «Nuevo producto».'}
                    />
                    <Pagination page={result.page} size={result.size} total={result.total} onChange={setPage} />
                </>
            )}

            <Modal
                open={Boolean(deactivateTarget)}
                title="¿Desactivar este producto?"
                description={
                    deactivateTarget
                        ? `«${deactivateTarget.name}» dejará de verse en la tienda. Los pedidos que ya lo incluyen no cambian y puedes reactivarlo cuando quieras.`
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