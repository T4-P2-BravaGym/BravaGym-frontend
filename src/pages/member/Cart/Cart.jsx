import { useCallback, useEffect, useState } from 'react'
import CartSummary from '@/components/domain/CartSummary'
import OrderCard from '@/components/domain/OrderCard'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import Spinner from '@/components/ui/Spinner'
import useCart from '@/hooks/useCart'
import { PATHS } from '@/routes/paths'
import { cancelOrder, listMyOrders, placeOrder } from '@/services/orders'
import { formatEuros } from '@/utils/format'
import styles from './Cart.module.scss'

const PAGE_SIZE = 10
const LOAD_ORDERS_ERROR = 'No se han podido cargar tus pedidos. Inténtalo de nuevo.'
const CHECKOUT_ERROR = 'No se ha podido hacer el pedido. Inténtalo de nuevo.'
const CANCEL_ERROR = 'No se ha podido cancelar el pedido. Inténtalo de nuevo.'

export default function Cart() {
  const { items, setQuantity, removeItem, clear } = useCart()
  const [orders, setOrders] = useState(null)
  const [ordersError, setOrdersError] = useState(null)
  const [page, setPage] = useState(1)
  const [checkingOut, setCheckingOut] = useState(false)
  const [flash, setFlash] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [toCancel, setToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const loadOrders = useCallback(
      (signal) =>
          listMyOrders({ page, size: PAGE_SIZE, signal })
              .then((data) => {
                setOrders(data)
                setOrdersError(null)
              })
              .catch((apiError) => {
                if (apiError.name === 'AbortError') return
                setOrdersError(apiError.detail ?? LOAD_ORDERS_ERROR)
              }),
      [page],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadOrders(controller.signal)
    return () => controller.abort()
  }, [loadOrders])

  async function handleCheckout() {
    if (checkingOut || items.length === 0) return
    setCheckingOut(true)
    setFlash(null)
    setActionError(null)
    try {
      const order = await placeOrder(items)
      clear()
      setFlash(
          `¡Pedido hecho! Total: ${formatEuros(order.total_cents)}. Págalo en Mis pagos y recógelo en recepción.`,
      )
      if (page === 1) await loadOrders()
      else setPage(1)
    } catch (apiError) {
      setActionError(apiError.detail ?? CHECKOUT_ERROR)
    } finally {
      setCheckingOut(false)
    }
  }

  async function handleConfirmCancel() {
    if (!toCancel) return
    setCancelling(true)
    setFlash(null)
    setActionError(null)
    try {
      await cancelOrder(toCancel.id)
      setFlash(`Has cancelado el pedido n.º ${toCancel.id}. No tienes que pagar nada.`)
      await loadOrders()
    } catch (apiError) {
      setActionError(apiError.detail ?? CANCEL_ERROR)
    } finally {
      setCancelling(false)
      setToCancel(null)
    }
  }

  return (
      <div className={styles.root}>
        <PageHeader
            eyebrow="Tienda Brava"
            title="Carrito y pedidos"
            lead="Confirma tu pedido, págalo en Mis pagos y recógelo en recepción."
        />

        {flash && (
            <Alert tone="success" onClose={() => setFlash(null)}>
              {flash}
            </Alert>
        )}
        {actionError && (
            <Alert tone="error" title="No se ha podido completar" onClose={() => setActionError(null)}>
              {actionError}
            </Alert>
        )}

        <section className={styles.section} aria-labelledby="cart-heading">
          <div className={styles.sectionHead}>
            <h2 id="cart-heading" className={styles.sectionTitle}>
              Tu carrito
            </h2>
            {items.length > 0 && (
                <Button variant="secondary" size="sm" to={PATHS.shop}>
                  Seguir comprando
                </Button>
            )}
          </div>

          {items.length === 0 ? (
              <EmptyState
                  title="Tu carrito está vacío"
                  text="Añade productos desde la tienda y recógelos en recepción."
                  action={<Button to={PATHS.shop}>Ir a la tienda</Button>}
              />
          ) : (
              <CartSummary
                  items={items}
                  busy={checkingOut}
                  onChangeQuantity={setQuantity}
                  onRemove={removeItem}
                  onCheckout={handleCheckout}
              />
          )}
        </section>

        <section className={styles.section} aria-labelledby="orders-heading">
          <h2 id="orders-heading" className={styles.sectionTitle}>
            Mis pedidos
          </h2>

          {ordersError && <Alert tone="error">{ordersError}</Alert>}
          {!orders && !ordersError && <Spinner label="Cargando tus pedidos…" />}
          {orders && orders.items.length === 0 && (
              <EmptyState title="Aún no has hecho ningún pedido" text="Cuando confirmes uno aparecerá aquí." />
          )}
          {orders && orders.items.length > 0 && (
              <>
                <ul className={styles.orderList}>
                  {orders.items.map((order) => (
                      <li key={order.id}>
                        <OrderCard
                            order={order}
                            busy={cancelling && toCancel?.id === order.id}
                            onCancel={setToCancel}
                        />
                      </li>
                  ))}
                </ul>
                <Pagination page={orders.page} size={orders.size} total={orders.total} onChange={setPage} />
              </>
          )}
        </section>

        <Modal
            open={toCancel !== null}
            title="¿Cancelar este pedido?"
            description={
              toCancel
                  ? `Pedido n.º ${toCancel.id} · ${formatEuros(toCancel.total_cents)}. No tendrás que pagarlo y los productos volverán a estar disponibles en la tienda.`
                  : undefined
            }
            confirmLabel="Sí, cancelar pedido"
            cancelLabel="No, mantenerlo"
            tone="danger"
            busy={cancelling}
            onConfirm={handleConfirmCancel}
            onClose={() => setToCancel(null)}
        />
      </div>
  )
}