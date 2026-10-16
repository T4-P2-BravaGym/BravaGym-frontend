import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { formatWeekLabel } from '@/utils/week'
import WeekNav from './WeekNav'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const anchor = new Date('2026-10-14T10:00:00Z')

describe('WeekNav', () => {
    it('shows the week of the anchor date', () => {
        render(<WeekNav anchor={anchor} onChange={() => {}} />)

        expect(screen.getByRole('group', { name: 'Semana' })).toHaveTextContent(formatWeekLabel(anchor))
    })

    it('moves one week back and one week forward', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(<WeekNav anchor={anchor} onChange={onChange} />)

        await user.click(screen.getByRole('button', { name: 'Semana anterior' }))
        await user.click(screen.getByRole('button', { name: 'Semana siguiente' }))

        expect(onChange).toHaveBeenNthCalledWith(1, new Date(anchor.getTime() - WEEK_MS))
        expect(onChange).toHaveBeenNthCalledWith(2, new Date(anchor.getTime() + WEEK_MS))
    })
})