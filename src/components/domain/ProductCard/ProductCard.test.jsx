import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProductCard from './ProductCard'

const shirt = {
    id: 3,
    name: 'Camiseta Brava',
    category_name: 'Ropa',
    price_cents: 2500,
    stock: 3,
    sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 1 },
    ],
    image_url: null,
}
const protein = { id: 5, name: 'Proteína', price_cents: 3000, stock: 4, sizes: [], image_url: null }

describe('ProductCard', () => {
    it('adds a product without sizes', async () => {
        const user = userEvent.setup()
        const onAdd = vi.fn()
        render(<ProductCard product={protein} onAdd={onAdd} />)

        await user.click(screen.getByRole('button', { name: 'Añadir Proteína al carrito' }))

        expect(onAdd).toHaveBeenCalledWith(protein, null)
    })

    it('asks for a size before adding clothing (RN-20)', async () => {
        const user = userEvent.setup()
        const onAdd = vi.fn()
        render(<ProductCard product={shirt} onAdd={onAdd} />)

        expect(screen.getByRole('button', { name: 'Elige una talla de Camiseta Brava' })).toBeDisabled()

        await user.click(screen.getByRole('button', { name: 'S' }))
        await user.click(screen.getByRole('button', { name: 'Añadir Camiseta Brava en talla S al carrito' }))

        expect(onAdd).toHaveBeenCalledWith(shirt, 'S')
    })

    it('disables a sold-out size', () => {
        render(<ProductCard product={shirt} />)
        expect(screen.getByRole('button', { name: 'M, agotada' })).toBeDisabled()
    })

    it('shows "Agotado" and no add button without stock', () => {
        render(<ProductCard product={{ ...protein, stock: 0 }} />)

        expect(screen.getByText('Agotado')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows the photo from the API (HU-30)', () => {
        const { container } = render(<ProductCard product={{ ...protein, image_url: '/media/products/a.webp' }} />)
        const image = container.querySelector('img')

        expect(image.getAttribute('src')).toMatch(/^https?:\/\/.+\/media\/products\/a\.webp$/)
    })
})