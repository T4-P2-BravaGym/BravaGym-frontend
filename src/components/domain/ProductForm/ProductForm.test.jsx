import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProductForm from './ProductForm'

const categories = [
    { id: 1, name: 'Ropa' },
    { id: 2, name: 'Suplementos' },
]

function renderForm(props) {
    const onSubmit = vi.fn()
    const result = render(<ProductForm product={null} categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} {...props} />)
    return { ...result, onSubmit }
}

describe('ProductForm', () => {
    it('sends stock and no sizes for a product without sizes', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderForm()

        await user.type(screen.getByLabelText('Nombre'), 'Proteína')
        await user.selectOptions(screen.getByLabelText('Categoría'), '2')
        await user.type(screen.getByLabelText('Precio (€)'), '29,90')
        await user.clear(screen.getByLabelText('Stock'))
        await user.type(screen.getByLabelText('Stock'), '5')
        await user.click(screen.getByRole('button', { name: 'Crear producto' }))

        expect(onSubmit).toHaveBeenCalledWith(
            { name: 'Proteína', category_id: 2, price_cents: 2990, description: null, stock: 5, sizes: [] },
            null,
        )
    })

    it('sends the stock of each size and no product stock for clothing (RN-20)', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderForm()

        await user.type(screen.getByLabelText('Nombre'), 'Camiseta Brava')
        await user.selectOptions(screen.getByLabelText('Categoría'), '1')
        await user.type(screen.getByLabelText('Precio (€)'), '25')
        await user.click(screen.getByLabelText('Tiene tallas'))
        await user.type(screen.getByLabelText('S'), '3')
        await user.type(screen.getByLabelText('M'), '0')
        await user.click(screen.getByRole('button', { name: 'Crear producto' }))

        const [body] = onSubmit.mock.calls[0]
        expect(body.sizes).toEqual([
            { size: 'S', stock: 3 },
            { size: 'M', stock: 0 },
        ]) // empty sizes are not sold
        expect(body).not.toHaveProperty('stock')
    })

    it('fills in a product to edit', () => {
        renderForm({
            product: {
                id: 3,
                name: 'Camiseta Brava',
                category_id: 1,
                price_cents: 2500,
                stock: 0,
                description: 'Algodón orgánico',
                sizes: [{ size: 'M', stock: 4 }],
                image_url: null,
            },
        })

        expect(screen.getByRole('heading', { name: 'Editar «Camiseta Brava»' })).toBeInTheDocument()
        expect(screen.getByLabelText('Precio (€)')).toHaveValue('25,00')
        expect(screen.getByLabelText('M')).toHaveValue(4)
        expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
    })

    it('sends a new photo apart from the body (HU-30)', async () => {
        const user = userEvent.setup()
        const { container, onSubmit } = renderForm()
        const file = new File(['png'], 'foto.png', { type: 'image/png' })

        fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } })
        await screen.findByText('foto.png · se sube al guardar.')
        await user.click(screen.getByRole('button', { name: 'Crear producto' }))

        expect(onSubmit.mock.calls[0][1]).toEqual({ file })
    })

    it('asks to remove the saved photo (HU-30)', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderForm({
            product: { id: 5, name: 'Proteína', category_id: 2, price_cents: 3000, stock: 4, sizes: [], image_url: '/media/products/a.webp' },
        })

        await user.click(screen.getByRole('button', { name: 'Quitar foto' }))
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

        expect(onSubmit.mock.calls[0][1]).toEqual({ remove: true })
    })
})