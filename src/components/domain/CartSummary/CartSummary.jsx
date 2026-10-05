import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Icon from '@/components/ui/Icon'
import { formatEuros } from '@/utils/format'
import styles from './CartSummary.module.scss'

/**
 * CartSummary
 * The cart: lines with quantity (never above stock), estimated total and checkout.
 * The real total is computed by the API from its own prices (never trust the client's).
 *
 * Props: items [{ product_id, name, unit_price_cents, quantity, stock }], busy,
 *        onChangeQuantity(productId, quantity), onRemove(productId), onCheckout
 */
export default function CartSummary({ items, busy = false, onChangeQuantity, onRemove, onCheckout }) {
  if (!items.length) {
    return <EmptyState title="Tu carrito está vacío" text="Añade productos desde la tienda y recógelos en recepción." />
  }

  const estimated = items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0)

  return (
    <section className={styles.root} aria-label="Carrito">
      <ul className={styles.lines}>
        {items.map((item) => (
          <li key={item.product_id} className={styles.line}>
            <div className={styles.info}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.unit}>{formatEuros(item.unit_price_cents)} / unidad</span>
            </div>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepButton}
                aria-label={`Quitar una unidad de ${item.name}`}
                disabled={busy || item.quantity <= 1}
                onClick={() => onChangeQuantity?.(item.product_id, item.quantity - 1)}
              >
                <Icon name="minus" size={16} />
              </button>
              <span className={styles.quantity} aria-label={`Cantidad: ${item.quantity}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                className={styles.stepButton}
                aria-label={`Añadir una unidad de ${item.name}`}
                disabled={busy || item.quantity >= item.stock}
                onClick={() => onChangeQuantity?.(item.product_id, item.quantity + 1)}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <span className={styles.subtotal}>{formatEuros(item.unit_price_cents * item.quantity)}</span>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Eliminar ${item.name} del carrito`}
              disabled={busy}
              onClick={() => onRemove?.(item.product_id)}
            >
              <Icon name="trash" size={18} />
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.total}>
        <span>Total estimado</span>
        <span className={styles.totalAmount}>{formatEuros(estimated)}</span>
      </div>
      <p className={styles.note}>El importe final se calcula al confirmar, con los precios y descuentos vigentes.</p>
      <Button fullWidth disabled={busy} onClick={onCheckout}>
        {busy ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </section>
  )
}
