import { describe, expect, it } from 'vitest'
import { bookingSession, bookingSessionId, bookingsBySessionId } from './bookings'

// Same shape as BookingOut in the API
const confirmed = {
    id: 12,
    status: 'confirmed',
    waitlist_position: null,
    class_session: {
        id: 3,
        starts_at: '2026-10-19T16:30:00',
        duration_minutes: 60,
        class_type: { id: 1, name: 'Fuerza básica' },
    },
}

describe('booking helpers', () => {
    it('reads the session the API nests in class_session', () => {
        expect(bookingSession(confirmed).class_type.name).toBe('Fuerza básica')
        expect(bookingSessionId(confirmed)).toBe(3)
    })

    it('keys active bookings by session id and skips cancelled ones', () => {
        const cancelled = {
            ...confirmed,
            id: 13,
            status: 'cancelled',
            class_session: { ...confirmed.class_session, id: 4 },
        }

        expect(bookingsBySessionId([confirmed, cancelled])).toEqual({
            3: { id: 12, status: 'confirmed', waitlist_position: null },
        })
    })
})