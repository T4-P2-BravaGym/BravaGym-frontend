import { useRef, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Icon from '@/components/ui/Icon'
import Tabs from '@/components/ui/Tabs'
import styles from './RoutineEditor.module.scss'

const EMPTY_LINE = { exercise_id: '', sets: 3, reps: 10, rest_seconds: 60 }

/**
 * RoutineEditor
 * Trainers create a routine for a member: member, name, days and, for each day, its
 * exercises with sets, reps and rest. It validates before saving and sends `onSave` the
 * body the API expects: positions are numbered here, so day + position never repeat.
 *
 * Props: members [{ id, name }], exercises [{ id, name }],
 *        initialRoutine { member_id, name, lines: [{ day_number, position, exercise_id, sets, reps, rest_seconds }] },
 *        busy, error (message from the API), onSave(payload)
 */
export default function RoutineEditor({ members, exercises, initialRoutine, busy = false, error, onSave }) {
  const nextKey = useRef(0)
  const withKey = (line) => ({ ...line, key: nextKey.current++ })

  const [memberId, setMemberId] = useState(initialRoutine?.member_id ?? '')
  const [name, setName] = useState(initialRoutine?.name ?? '')
  const [days, setDays] = useState(() => toDays(initialRoutine?.lines, withKey))
  const [activeDay, setActiveDay] = useState(days[0].day)
  const [errors, setErrors] = useState({})

  const current = days.find((d) => d.day === activeDay) ?? days[0]

  function updateLines(update) {
    setDays((all) => all.map((d) => (d.day === current.day ? { ...d, lines: update(d.lines) } : d)))
  }

  function changeLine(key, field, value) {
    updateLines((lines) => lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)))
  }

  function addDay() {
    const day = Math.max(...days.map((d) => d.day)) + 1
    setDays((all) => [...all, { day, lines: [withKey(EMPTY_LINE)] }])
    setActiveDay(day)
  }

  function removeDay() {
    if (days.length === 1) return
    const remaining = days.filter((d) => d.day !== current.day).map((d, index) => ({ ...d, day: index + 1 }))
    setDays(remaining)
    setActiveDay(remaining[0].day)
  }

  function validate() {
    const found = {}
    if (!memberId) found.member = 'Elige la socia.'
    if (!name.trim()) found.name = 'Escribe un nombre para la rutina.'
    const allLines = days.flatMap((d) => d.lines)
    if (!allLines.length) found.lines = 'Añade al menos un ejercicio.'
    else if (allLines.some((l) => !l.exercise_id)) found.lines = 'Elige el ejercicio de cada línea.'
    else if (allLines.some((l) => !(l.sets > 0 && l.reps > 0 && l.rest_seconds >= 0)))
      found.lines = 'Series y repeticiones tienen que ser mayores que 0.'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSave?.({
      member_id: Number(memberId),
      name: name.trim(),
      exercises: days.flatMap((d) =>
        d.lines.map((line, index) => ({
          day_number: d.day,
          position: index + 1,
          exercise_id: Number(line.exercise_id),
          sets: Number(line.sets),
          reps: Number(line.reps),
          rest_seconds: Number(line.rest_seconds),
        })),
      ),
    })
  }

  return (
    <form className={styles.root} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <Field label="Socia" as="select" value={memberId} onChange={(e) => setMemberId(e.target.value)} error={errors.member}>
          <option value="">Elige una socia</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Field>
        <Field
          label="Nombre de la rutina"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Fuerza · bloque 1"
        />
      </div>

      <Tabs
        label="Días de la rutina"
        tabs={days.map((d) => ({ id: d.day, label: `Día ${d.day}` }))}
        active={current.day}
        onChange={setActiveDay}
        action={
          <Button variant="quiet" size="sm" onClick={addDay}>
            <Icon name="plus" size={16} /> Añadir día
          </Button>
        }
      >
        <div className={styles.lines}>
          <div className={styles.columns} aria-hidden="true">
            <span>Ejercicio</span>
            <span>Series</span>
            <span>Reps</span>
            <span>Descanso (s)</span>
            <span />
          </div>
          {current.lines.map((line, index) => (
            <div key={line.key} className={styles.line}>
              <select
                className={styles.control}
                aria-label={`Ejercicio ${index + 1}`}
                value={line.exercise_id}
                onChange={(e) => changeLine(line.key, 'exercise_id', e.target.value)}
              >
                <option value="">Elige un ejercicio</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <input
                className={styles.control}
                type="number"
                min="1"
                max="20"
                inputMode="numeric"
                aria-label={`Series del ejercicio ${index + 1}`}
                value={line.sets}
                onChange={(e) => changeLine(line.key, 'sets', e.target.value)}
              />
              <input
                className={styles.control}
                type="number"
                min="1"
                max="100"
                inputMode="numeric"
                aria-label={`Repeticiones del ejercicio ${index + 1}`}
                value={line.reps}
                onChange={(e) => changeLine(line.key, 'reps', e.target.value)}
              />
              <input
                className={styles.control}
                type="number"
                min="0"
                max="600"
                step="15"
                inputMode="numeric"
                aria-label={`Descanso en segundos del ejercicio ${index + 1}`}
                value={line.rest_seconds}
                onChange={(e) => changeLine(line.key, 'rest_seconds', e.target.value)}
              />
              <button
                type="button"
                className={styles.remove}
                aria-label={`Quitar el ejercicio ${index + 1}`}
                onClick={() => updateLines((lines) => lines.filter((l) => l.key !== line.key))}
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
          <div className={styles.lineActions}>
            <Button variant="secondary" size="sm" onClick={() => updateLines((lines) => [...lines, withKey(EMPTY_LINE)])}>
              <Icon name="plus" size={16} /> Añadir ejercicio
            </Button>
            {days.length > 1 && (
              <Button variant="danger" size="sm" onClick={removeDay}>
                Quitar el día {current.day}
              </Button>
            )}
          </div>
        </div>
      </Tabs>

      {errors.lines && <Alert tone="error">{errors.lines}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className={styles.footer}>
        <p className={styles.note}>Al guardar, la rutina anterior de la socia deja de estar activa.</p>
        <Button type="submit" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar rutina'}
        </Button>
      </div>
    </form>
  )
}

// Groups the API lines by day; an empty routine starts with Day 1 and one empty line.
function toDays(lines, withKey) {
  if (!lines?.length) return [{ day: 1, lines: [withKey(EMPTY_LINE)] }]
  const byDay = new Map()
  ;[...lines]
    .sort((a, b) => a.day_number - b.day_number || a.position - b.position)
    .forEach((line) => {
      if (!byDay.has(line.day_number)) byDay.set(line.day_number, [])
      byDay.get(line.day_number).push(
        withKey({
          exercise_id: String(line.exercise_id),
          sets: line.sets,
          reps: line.reps,
          rest_seconds: line.rest_seconds,
        }),
      )
    })
  return [...byDay.entries()].map(([day, dayLines]) => ({ day, lines: dayLines }))
}
