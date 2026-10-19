import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useCart from '@/hooks/useCart'
import { CartProvider, lineKey } from './CartContext'

const auth = vi.hoisted(() => ({ current: null }))
vi.mock('@/hooks/useAuth', () => ({ default: () => auth.current }))

const shirt = {
    id: 3,
    name: 'Camiseta Brava',
    price_cents: 2500,
    stock: 0,
    sizes: [
        { size: 'S', stock: 2 },
        { size: 'M', stock: 1 },
    ],
}
const protein = { id: 5, name: 'Proteína', price_cents: 3000, stock: 2, sizes: [] }

function renderCart() {
    return renderHook(() => useCart(), { wrapper: CartProvider })
}

beforeEach(() => {
    auth.current = { user: { id: 7 }, role: 'member' }
})

describe('lineKey', () => {
    it('joins product and size, or uses the product alone', () => {
        expect(lineKey(3, 'M')).toBe('3:M')
        expect(lineKey(5, null)).toBe('5')
    })
})

describe('CartProvider', () => {
    it('keeps the same shirt in two sizes as two lines', () => {
        const { result } = renderCart()

        act(() => {
            result.current.addItem(shirt, 'S')
        })
        act(() => {
            result.current.addItem(shirt, 'M')
        })

        expect(result.current.items.map((item) => item.key)).toEqual(['3:S', '3:M'])
        expect(result.current.count).toBe(2)
    })

    it('stops at the stock of the size', () => {
        const { result } = renderCart()
        let added

        act(() => {
            result.current.addItem(shirt, 'M')
        })
        act(() => {
            added = result.current.addItem(shirt, 'M') // only 1 left in M
        })

        expect(added).toBe(false)
        expect(result.current.items[0].quantity).toBe(1)
    })

    it('uses the product stock when it has no sizes', () => {
        const { result } = renderCart()
        let added

        act(() => {
            added = result.current.addItem({ ...protein, stock: 0 })
        })

        expect(added).toBe(false)
        expect(result.current.items).toEqual([])
    })

    it('keeps the quantity between 1 and the stock', () => {
        const { result } = renderCart()
        act(() => {
            result.current.addItem(protein)
        })

        act(() => {
            result.current.setQuantity('5', 10)
        })
        expect(result.current.items[0].quantity).toBe(2)

        act(() => {
            result.current.setQuantity('5', 0)
        })
        expect(result.current.items[0].quantity).toBe(1)
    })

    it('saves the cart for each member', () => {
        const { result } = renderCart()
        act(() => {
            result.current.addItem(protein)
        })

        const saved = JSON.parse(localStorage.getItem('brava.cart.7'))
        expect(saved).toHaveLength(1)
        expect(saved[0]).toMatchObject({ product_id: 5, quantity: 1 })
    })

    it('reads an old cart saved before sizes existed', () => {
        localStorage.setItem(
            'brava.cart.7',
            JSON.stringify([{ product_id: 5, name: 'Proteína', unit_price_cents: 3000, quantity: 2, stock: 2 }]),
        )

        const { result } = renderCart()

        expect(result.current.items[0]).toMatchObject({ key: '5', size: null, quantity: 2 })
    })

    it('has no cart for a trainer', () => {
        auth.current = { user: { id: 2 }, role: 'trainer' }
        localStorage.setItem('brava.cart.2', JSON.stringify([{ product_id: 5, quantity: 1, stock: 2 }]))

        const { result } = renderCart()

        expect(result.current.items).toEqual([])
    })
})