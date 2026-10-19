import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import ExerciseRow from '@/components/domain/ExerciseRow'

export default function RoutineDays({ days }) {
    const [activeDay, setActiveDay] = useState(null)

    if (days.length === 0) return <p>Esta rutina no tiene ejercicios.</p>

    const tabs = days.map((day) => ({ id: day.day_number, label: `Día ${day.day_number}` }))
    const currentDay = days.find((day) => day.day_number === activeDay) ?? days[0]

    return (
        <Tabs tabs={tabs} active={currentDay.day_number} onChange={setActiveDay} label="Día de la rutina">
            <ol>
                {currentDay.lines.map((line) => (
                <ExerciseRow key={line.position} line={line} />
                ))}
            </ol>
        </Tabs>
    )
}