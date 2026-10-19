import { useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Tabs from '@/components/ui/Tabs'
import { madridInputToUtcIso, utcIsoToMadridInput } from '@/utils/format'
import { weeklySlotDates } from '@/utils/weeklySlots'
import { plural } from './slotHelpers'
import WeeklyFields from './WeeklyFields'
import styles from './TrainerSlots.module.scss'

const SINGLE_REQUIRED = 'Elige la fecha y la hora de inicio.'
const WEEKLY_REQUIRED = 'Elige al menos un día, una hora y la fecha de inicio.'
const DEFAULT_WEEKS = '4'

const MODE_TABS = [
    { id: 'weekly', label: 'Horario semanal' },
    { id: 'single', label: 'Franja suelta' },
]

function todayInMadrid() {
    return utcIsoToMadridInput(new Date().toISOString()).slice(0, 10)
}

function emptyWeekly() {
    return { weekdays: [], times: ['11:00'], start_date: todayInMadrid(), weeks: DEFAULT_WEEKS }
}

function buildWeeklyBody(weekly) {
    const times = [...new Set(weekly.times.filter(Boolean))].sort()
    if (weekly.weekdays.length === 0 || times.length === 0 || !weekly.start_date) return null
    return {
        weekdays: [...weekly.weekdays].sort((a, b) => a - b),
        times,
        start_date: weekly.start_date,
        weeks: Number(weekly.weeks),
    }
}

export default function SlotForm({ busy, onSubmitWeekly, onSubmitSingle, onCancel }) {
    const [mode, setMode] = useState('weekly')
    const [weekly, setWeekly] = useState(emptyWeekly)
    const [startsAtLocal, setStartsAtLocal] = useState('')
    const [formError, setFormError] = useState(null)

    const preview = useMemo(
        () =>
            weeklySlotDates({
                startDate: weekly.start_date,
                weeks: weekly.weeks,
                weekdays: weekly.weekdays,
                times: weekly.times,
            }),
        [weekly],
    )

    function handleSubmit(event) {
        event.preventDefault()
        setFormError(null)

        if (mode === 'weekly') {
            const body = buildWeeklyBody(weekly)
            if (!body) {
                setFormError(WEEKLY_REQUIRED)
                return
            }
            onSubmitWeekly(body)
            return
        }

        const startsAt = madridInputToUtcIso(startsAtLocal)
        if (!startsAt) {
            setFormError(SINGLE_REQUIRED)
            return
        }
        onSubmitSingle({ starts_at: startsAt })
    }

    const submitLabel =
        mode === 'single'
            ? 'Abrir franja'
            : preview.length > 0
                ? `Abrir ${preview.length} ${plural(preview.length, 'franja', 'franjas')}`
                : 'Abrir franjas'

    return (
        <section className={styles.formSection} aria-labelledby="slot-form-heading">
            <div className={styles.sectionIntro}>
                <h2 id="slot-form-heading" className={styles.sectionTitle}>
                    Abrir franjas
                </h2>
                <p className={styles.sectionLead}>
                    Cada franja dura 60 minutos y es para una sola socia. Las horas son del horario de Madrid.
                </p>
            </div>

            <Tabs tabs={MODE_TABS} active={mode} onChange={setMode} label="Cómo abrir las franjas">
                {formError && <Alert tone="error">{formError}</Alert>}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {mode === 'weekly' ? (
                        <WeeklyFields value={weekly} onChange={setWeekly} preview={preview} disabled={busy} />
                    ) : (
                        <Field
                            label="Fecha y hora de inicio"
                            type="datetime-local"
                            name="starts_at_local"
                            value={startsAtLocal}
                            onChange={(event) => setStartsAtLocal(event.target.value)}
                            hint="Horario de Madrid"
                            disabled={busy}
                        />
                    )}

                    <div className={styles.formActions}>
                        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={busy}>
                            {busy ? 'Guardando…' : submitLabel}
                        </Button>
                    </div>
                </form>
            </Tabs>
        </section>
    )
}