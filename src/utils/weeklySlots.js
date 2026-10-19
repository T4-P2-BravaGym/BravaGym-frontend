export const WEEKDAYS = [
    { value: 0, short: 'Lun', name: 'lunes' },
    { value: 1, short: 'Mar', name: 'martes' },
    { value: 2, short: 'Mié', name: 'miércoles' },
    { value: 3, short: 'Jue', name: 'jueves' },
    { value: 4, short: 'Vie', name: 'viernes' },
    { value: 5, short: 'Sáb', name: 'sábado' },
    { value: 6, short: 'Dom', name: 'domingo' },
]

export const MAX_SLOT_TIMES = 4
export const MAX_SLOT_WEEKS = 8

const MS_PER_DAY = 86_400_000

function parseDay(day) {
    const [year, month, date] = String(day ?? '').split('-').map(Number)
    if (![year, month, date].every(Number.isFinite)) return null
    const parsed = new Date(Date.UTC(year, month - 1, date))
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

function weekdayIndex(date) {
    return (date.getUTCDay() + 6) % 7
}

export function weeklySlotDates({ startDate, weeks, weekdays = [], times = [] }) {
    const start = parseDay(startDate)
    const weekCount = Number(weeks)
    if (!start || !Number.isInteger(weekCount) || weekCount < 1) return []

    const chosenDays = new Set(weekdays)
    const sortedTimes = [...new Set(times.filter(Boolean))].sort()
    const slots = []

    for (let offset = 0; offset < weekCount * 7; offset += 1) {
        const date = new Date(start.getTime() + offset * MS_PER_DAY)
        if (!chosenDays.has(weekdayIndex(date))) continue
        const day = date.toISOString().slice(0, 10)
        for (const time of sortedTimes) slots.push({ day, time })
    }
    return slots
}

export function formatSlotDay(day) {
    const date = parseDay(day)
    if (!date) return day
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    }).format(date)
}