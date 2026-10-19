import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatTimeRange } from '@/utils/format'
import { isBooked } from './slotHelpers'
import styles from './TrainerSlots.module.scss'

export default function SlotRow({ slot, busy, onCancel }) {
    const isCancelled = slot.status === 'cancelled'
    const booked = isBooked(slot)

    return (
        <li className={styles.item}>
            <div className={styles.itemMain}>
                <p className={styles.itemName}>{formatDate(slot.starts_at)}</p>
                <p className={styles.itemMeta}>
                    {formatTimeRange(slot.starts_at, slot.ends_at)}
                    {slot.duration_minutes ? ` · ${slot.duration_minutes} min` : ''}
                </p>
            </div>
            <div className={styles.itemAside}>
                {isCancelled ? (
                    <Badge status="cancelled" />
                ) : (
                    <Badge tone={booked ? 'brand' : 'success'}>{booked ? 'Reservada' : 'Libre'}</Badge>
                )}
                {!isCancelled && onCancel && (
                    <Button variant="secondary" size="sm" disabled={busy} onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </li>
    )
}