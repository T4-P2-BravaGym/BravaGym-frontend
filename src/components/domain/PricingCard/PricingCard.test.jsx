import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PricingCard from './PricingCard'

const basic = {
    id: 1,
    name: 'Básico',
    description: 'Hasta 2 clases a la semana.',
    monthly_price_cents: 3900,
    includes_personal_training: false,
}
const premium = {
    id: 3,
    name: 'Premium',
    description: 'Clases ilimitadas y entrenamiento personal.',
    monthly_price_cents: 8900,
    includes_personal_training: true,
}

describe('PricingCard', () => {
    it('lists personal training first and marks the featured plan', () => {
        render(<PricingCard plan={premium} features={['Eliges entrenadora y horario desde la app']} featured onSelect={() => {}} />)

        const lines = screen.getAllByRole('listitem').map((item) => item.textContent)
        expect(lines).toEqual(['Sesiones de 1 hora a solas con tu entrenadora', 'Eliges entrenadora y horario desde la app'])
        expect(screen.getByText('La más completa')).toBeInTheDocument()
    })

    it('calls onSelect with the plan', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        render(<PricingCard plan={basic} onSelect={onSelect} />)

        await user.click(screen.getByRole('button', { name: 'Elegir Básico' }))

        expect(onSelect).toHaveBeenCalledWith(basic)
    })

    it("marks the member's plan and hides the button", () => {
        render(<PricingCard plan={basic} current />)

        expect(screen.getByText('Tu plan')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})