import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { formatWeekLabel, shiftWeek } from '@/utils/week'
import styles from './WeekNav.module.scss'

export default function WeekNav({ anchor, onChange }) {
    return (
        <div className={styles.root} role="group" aria-label="Semana">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onChange(shiftWeek(anchor, -1))}
                aria-label="Semana anterior"
            >
                <Icon name="chevronLeft" size={18} />
            </Button>
            <p className={styles.label} aria-live="polite">
                {formatWeekLabel(anchor)}
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onChange(shiftWeek(anchor, 1))}
                aria-label="Semana siguiente"
            >
                <Icon name="chevronRight" size={18} />
            </Button>
        </div>
    )
}