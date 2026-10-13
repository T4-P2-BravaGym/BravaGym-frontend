import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { PATHS } from '@/routes/paths'
import { formatDateTime, formatEuros } from '@/utils/format'
import styles from './OrderCard.module.scss'

const ORDER_STATUS = {
    pending: { label: 'Pendiente de pago', tone: 'wait' },
    paid: { label: 'Pagado', tone: 'success' },
    cancelled: { label: 'Cancelado', tone: 'neutral' },
}

export default function OrderCard({ order, busy = false, onCancel }) {
    const info = ORDER_STATUS[order.status] ?? { label: order.status, tone: 'neutral' }
    const canCancel = order.status === 'pending' && (order.payment_status ?? 'pending') === 'pending'

    return (
        <article className={styles.root}>
            <header className={styles.head}>
                <div>
                    <h3 className={styles.title}>Pedido n.º {order.id}</h3>
                    <p className={styles.meta}>{formatDateTime(order.created_at)}</p>
                </div>
                <Badge tone={info.tone}>{info.label}</Badge>
            </header>

            <ul className={styles.lines}>
                {order.items.map((item) => (
                    <li key={`${item.product_id}-${item.size ?? ''}`} className={styles.line}>
                        <span>
                            {item.quantity} × {item.product_name}
                            {item.size ? ` · talla ${item.size}` : ''}
                        </span>
            <span>
              {item.quantity} × {item.product_name}
            </span>
                        <span className={styles.amount}>{formatEuros(item.subtotal_cents)}</span>
                    </li>
                ))}
            </ul>

            <div className={styles.total}>
                <span>Total</span>
                <span className={styles.amount}>{formatEuros(order.total_cents)}</span>
            </div>

            {canCancel && <p className={styles.note}>Págalo en Mis pagos y recógelo en recepción.</p>}
            {order.status === 'paid' && <p className={styles.note}>Ya está pagado: recógelo en recepción.</p>}

            {canCancel && (
                <div className={styles.actions}>
                    <Button variant="secondary" size="sm" to={PATHS.myPayments}>
                        Ir a Mis pagos
                    </Button>
                    <Button variant="danger" size="sm" disabled={busy} onClick={() => onCancel?.(order)}>
                        Cancelar pedido
                    </Button>
                </div>
            )}
        </article>
    )
}