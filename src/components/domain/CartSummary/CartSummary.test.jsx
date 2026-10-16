import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CartSummary from './CartSummary'

const shirt = { key: '3:M', product_id: 3, size: 'M', name: 'Camiseta Brava', unit_price_cents: 2500, quantity: 2, stock: 2 }
const protein = { key: '5', product_id: 5, size: null, name: 'Proteína', unit_price_cents: 3000, quantity: 1, stock: 4 }

describe('CartSummary', () => {
    it('shows an empty state without items', () => {
        render(<CartSummary items={[]} />)
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    })

    it('stops the "+" at the stock of the size', () => {
        render(<CartSummary items={[shirt]} />)

        expect(screen.getByRole('button', { name: 'Añadir una unidad de Camiseta Brava (talla M)' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Quitar una unidad de Camiseta Brava (talla M)' })).toBeEnabled()
    })

    it('stops the "−" at one unit', () => {
        render(<CartSummary items={[protein]} />)
        expect(screen.getByRole('button', { name: 'Quitar una unidad de Proteína' })).toBeDisabled()
    })

    it('changes the quantity and removes lines by their key', async () => {
        const user = userEvent.setup()
        const onChangeQuantity = vi.fn()
        const onRemove = vi.fn()
        render(<CartSummary items={[shirt]} onChangeQuantity={onChangeQuantity} onRemove={onRemove} />)

        await user.click(screen.getByRole('button', { name: 'Quitar una unidad de Camiseta Brava (talla M)' }))
        await user.click(screen.getByRole('button', { name: 'Eliminar Camiseta Brava (talla M) del carrito' }))

        expect(onChangeQuantity).toHaveBeenCalledWith('3:M', 1)
        expect(onRemove).toHaveBeenCalledWith('3:M')
    })

    it('adds up the estimated total and confirms', async () => {
        const user = userEvent.setup()
        const onCheckout = vi.fn()
        render(<CartSummary items={[shirt, protein]} onCheckout={onCheckout} />)

        expect(screen.getByText(/^80,00\s€$/)).toBeInTheDocument() // 2 × 25 € + 30 €

        await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
        expect(onCheckout).toHaveBeenCalled()
    })
})