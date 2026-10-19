import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Field from '@/components/ui/Field'
import { MAX_SLOT_TIMES, MAX_SLOT_WEEKS, WEEKDAYS, formatSlotDay } from '@/utils/weeklySlots'
import { plural } from './slotHelpers'
import styles from './TrainerSlots.module.scss'

const PREVIEW_LIMIT = 6
const WEEK_OPTIONS = Array.from({ length: MAX_SLOT_WEEKS }, (_, index) => index + 1)

export default function WeeklyFields({ value, onChange, preview, disabled }) {
    function update(patch) {
        onChange({ ...value, ...patch })
    }

    function toggleWeekday(day) {
        update({
            weekdays: value.weekdays.includes(day)
                ? value.weekdays.filter((current) => current !== day)
                : [...value.weekdays, day],
        })
    }

    function updateTime(index, time) {
        update({ times: value.times.map((current, position) => (position === index ? time : current)) })
    }

    return (
        <>
            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Días</legend>
                <div role="group" aria-label="Días de la semana" className={styles.chips}>
                    {WEEKDAYS.map((day) => (
                        <Chip
                            key={day.value}
                            selected={value.weekdays.includes(day.value)}
                            onClick={() => toggleWeekday(day.value)}
                            aria-label={day.name}
                            disabled={disabled}
                        >
                            {day.short}
                        </Chip>
                    ))}
                </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Horas de inicio</legend>
                <ul className={styles.timeList}>
                    {value.times.map((time, index) => (
                        <li key={index} className={styles.timeRow}>
                            <Field
                                label={`Hora ${index + 1}`}
                                type="time"
                                name={`time-${index}`}
                                value={time}
                                onChange={(event) => updateTime(index, event.target.value)}
                                disabled={disabled}
                            />
                            {value.times.length > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => update({ times: value.times.filter((_, position) => position !== index) })}
                                    disabled={disabled}
                                >
                                    Quitar
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
                {value.times.length < MAX_SLOT_TIMES && (
                    <div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => update({ times: [...value.times, ''] })}
                            disabled={disabled}
                        >
                            Añadir hora
                        </Button>
                    </div>
                )}
            </fieldset>

            <div className={styles.formRow}>
                <Field
                    label="Desde"
                    type="date"
                    name="start_date"
                    value={value.start_date}
                    onChange={(event) => update({ start_date: event.target.value })}
                    disabled={disabled}
                />
                <Field
                    label="Durante"
                    as="select"
                    name="weeks"
                    value={value.weeks}
                    onChange={(event) => update({ weeks: event.target.value })}
                    disabled={disabled}
                >
                    {WEEK_OPTIONS.map((count) => (
                        <option key={count} value={String(count)}>
                            {count} {plural(count, 'semana', 'semanas')}
                        </option>
                    ))}
                </Field>
            </div>

            <WeeklyPreview slots={preview} />
        </>
    )
}

function WeeklyPreview({ slots }) {
    if (slots.length === 0) {
        return <p className={styles.previewEmpty}>Elige al menos un día y una hora para ver las franjas.</p>
    }

    const shown = slots.slice(0, PREVIEW_LIMIT)
    const rest = slots.length - shown.length

    return (
        <div className={styles.preview} aria-live="polite">
            <p className={styles.previewTitle}>
                Vas a abrir {slots.length} {plural(slots.length, 'franja', 'franjas')}
            </p>
            <ul className={styles.previewList}>
                {shown.map((slot) => (
                    <li key={`${slot.day}-${slot.time}`}>
                        {formatSlotDay(slot.day)} · {slot.time}
                    </li>
                ))}
            </ul>
            {rest > 0 && <p className={styles.previewNote}>y {rest} más</p>}
            <p className={styles.previewNote}>
                Si alguna se solapa con otra de tus sesiones o ya ha pasado, no se abre y te lo indicamos.
            </p>
        </div>
    )
}