import { describe, expect, it } from 'vitest'
import { formatSlotDay, weeklySlotDates } from './weeklySlots'

describe('weeklySlotDates', () => {
    it('expands Monday, Wednesday and Friday at 11:00 for two weeks', () => {
        const slots = weeklySlotDates({
            startDate: '2026-10-19',
            weeks: 2,
            weekdays: [0, 2, 4],
            times: ['11:00'],
        })

        expect(slots).toHaveLength(6)
        expect(slots[0]).toEqual({ day: '2026-10-19', time: '11:00' })
        expect(slots.at(-1)).toEqual({ day: '2026-10-30', time: '11:00' })
    })

    it('sorts times and removes duplicates', () => {
        const slots = weeklySlotDates({
            startDate: '2026-10-19',
            weeks: 1,
            weekdays: [0],
            times: ['18:00', '11:00', '11:00'],
        })

        expect(slots.map((slot) => slot.time)).toEqual(['11:00', '18:00'])
    })

    it('starts on the first matching day after a mid-week start date', () => {
        const slots = weeklySlotDates({
            startDate: '2026-10-22',
            weeks: 1,
            weekdays: [0],
            times: ['11:00'],
        })

        expect(slots).toEqual([{ day: '2026-10-26', time: '11:00' }])
    })

    it('returns nothing when days, times or the period are missing', () => {
        const base = { startDate: '2026-10-19', weeks: 1, weekdays: [0], times: ['11:00'] }

        expect(weeklySlotDates({ ...base, weekdays: [] })).toEqual([])
        expect(weeklySlotDates({ ...base, times: [''] })).toEqual([])
        expect(weeklySlotDates({ ...base, weeks: 0 })).toEqual([])
        expect(weeklySlotDates({ ...base, startDate: '' })).toEqual([])
    })
})

describe('formatSlotDay', () => {
    it('shows a short Spanish day', () => {
        expect(formatSlotDay('2026-10-19')).toMatch(/19/)
        expect(formatSlotDay('2026-10-19')).toMatch(/oct/)
    })
})