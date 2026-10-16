import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import OrderCard from './OrderCard'

const order = {
    id: 12,
    status: 'pending',
    payment_status: 'pending',
    created_at: '2026-10-13T10:28:00',
    total_cents: 5000,
    items: [{ product_id: 3, product_name: 'Camiseta Brava', size: 'M', quantity: 2, subtotal_cents: 5000 }],
}

function renderOrder(props) {
    return render(
        <MemoryRouter>
            <OrderCard order={order} {...props} />
        </MemoryRouter>,
    )
}

describe('OrderCard', () => {
    it('shows each line once, with its size', () => {
        renderOrder()

        expect(screen.getAllByText(/2 × Camiseta Brava/)).toHaveLength(1)
        expect(screen.getByText('2 × Camiseta Brava · talla M')).toBeInTheDocument()
    })

    it('lets a pending order be cancelled', async () => {
        const user = userEvent.setup()
        const onCancel = vi.fn()
        renderOrder({ onCancel })

        expect(screen.getByRole('link', { name: 'Ir a Mis pagos' })).toHaveAttribute('href', '/mi-area/pagos')
        await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

        expect(onCancel).toHaveBeenCalledWith(order)
    })

    it('does not cancel a paid order', () => {
        renderOrder({ order: { ...order, status: 'paid', payment_status: 'paid' } })

        expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
        expect(screen.getByText('Ya está pagado: recógelo en recepción.')).toBeInTheDocument()
    })

    it('does not cancel a pending order whose payment is already paid', () => {
        renderOrder({ order: { ...order, payment_status: 'paid' } })
        expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
    })
})