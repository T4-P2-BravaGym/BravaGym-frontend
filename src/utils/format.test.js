import { describe, expect, it } from 'vitest'
import {
    centsToEurosInput,
    dayKey,
    eurosToCents,
    formatDate,
    formatEuros,
    formatTime,
    madridInputToUtcIso,
    parseApiDate,
    utcIsoToMadridInput,
} from './format'

describe('test environment', () => {
    it('runs in Madrid time', () => {
        expect(new Date(2026, 9, 13, 12).getTimezoneOffset()).toBe(-120)
    })
})

describe('parseApiDate', () => {
    it('reads a date-time without zone as UTC, as the API sends it', () => {
        expect(parseApiDate('2026-10-13T10:28:00').toISOString()).toBe('2026-10-13T10:28:00.000Z')
    })

    it('keeps the zone when the text has one', () => {
        expect(parseApiDate('2026-10-13T10:28:00Z').toISOString()).toBe('2026-10-13T10:28:00.000Z')
        expect(parseApiDate('2026-10-13T12:28:00+02:00').toISOString()).toBe('2026-10-13T10:28:00.000Z')
    })

    it('keeps a date without time on the same day', () => {
        expect(dayKey(parseApiDate('2026-10-13'))).toBe('2026-10-13')
    })

    it('returns the same Date when it already is one', () => {
        const date = new Date()
        expect(parseApiDate(date)).toBe(date)
    })
})

describe('formatTime', () => {
    it('shows the API time in Madrid time (T-09)', () => {
        expect(formatTime('2026-10-13T10:28:00')).toBe('12:28')
    })

    it('handles winter time', () => {
        expect(formatTime('2026-12-01T17:00:00')).toBe('18:00')
    })
})

describe('formatDate and dayKey', () => {
    const lateUtc = '2026-10-13T23:30:00'

    it('formatDate shows the Madrid day', () => {
        expect(formatDate(lateUtc)).toMatch(/14 oct/)
    })

    it('dayKey groups by the Madrid day', () => {
        expect(dayKey(lateUtc)).toBe('2026-10-14')
    })
})

describe('Madrid form inputs', () => {
    it('converts a Madrid input to UTC for the API', () => {
        expect(madridInputToUtcIso('2026-10-07T18:00')).toBe('2026-10-07T16:00:00.000Z')
        expect(madridInputToUtcIso('2026-12-01T18:00')).toBe('2026-12-01T17:00:00.000Z')
    })

    it('converts an API date back to the Madrid input', () => {
        expect(utcIsoToMadridInput('2026-10-07T16:00:00')).toBe('2026-10-07T18:00')
    })

    it('returns empty values for empty input', () => {
        expect(madridInputToUtcIso('')).toBeNull()
        expect(utcIsoToMadridInput(null)).toBe('')
    })
})

describe('eurosToCents', () => {
    it.each([
        ['12,50', 1250],
        ['12.5', 1250],
        [' 12,50 € ', 1250],
        ['19,99', 1999],
        ['0,29', 29],
        ['7', 700],
    ])('turns "%s" into %i cents', (text, cents) => {
        expect(eurosToCents(text)).toBe(cents)
    })

    it('returns null for an empty field', () => {
        expect(eurosToCents('')).toBeNull()
        expect(eurosToCents(null)).toBeNull()
    })

    it('returns the text untouched when it is not a number, so the API answers 422', () => {
        expect(eurosToCents('doce')).toBe('doce')
    })
})

describe('euro display', () => {
    it('formats cents as euros in Spanish', () => {
        expect(formatEuros(1999)).toMatch(/^19,99\s€$/)
        expect(formatEuros(null)).toMatch(/^0,00\s€$/)
    })

    it('prepares cents for a form field', () => {
        expect(centsToEurosInput(1250)).toBe('12,50')
        expect(centsToEurosInput(0)).toBe('0,00')
        expect(centsToEurosInput(null)).toBe('')
    })
})