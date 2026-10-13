import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from '@/hooks/useAuth'

export const CartContext = createContext(null)

const STORAGE_PREFIX = 'brava.cart.'

function readCart(key) {
    if (!key) return []
    try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeCart(key, items) {
    try {
        if (items.length) localStorage.setItem(key, JSON.stringify(items))
        else localStorage.removeItem(key)
    } catch {
    }
}

export function CartProvider({ children }) {
    const { user, role } = useAuth()
    const storageKey = role === 'member' && user?.id ? `${STORAGE_PREFIX}${user.id}` : null
    const [cart, setCart] = useState(() => ({ key: storageKey, items: readCart(storageKey) }))

    if (cart.key !== storageKey) {
        setCart({ key: storageKey, items: readCart(storageKey) })
    }
    const items = cart.key === storageKey ? cart.items : []

    useEffect(() => {
        if (cart.key) writeCart(cart.key, cart.items)
    }, [cart])

    const update = useCallback((change) => {
        setCart((current) => ({ ...current, items: change(current.items) }))
    }, [])

    const addItem = useCallback(
        (product) => {
            const line = items.find((item) => item.product_id === product.id)
            if (line && line.quantity >= product.stock) return false
            update((current) => {
                const fresh = {
                    product_id: product.id,
                    name: product.name,
                    unit_price_cents: product.price_cents,
                    stock: product.stock,
                }
                if (!current.some((item) => item.product_id === product.id)) {
                    return [...current, { ...fresh, quantity: 1 }]
                }
                return current.map((item) =>
                    item.product_id === product.id ? { ...item, ...fresh, quantity: item.quantity + 1 } : item,
                )
            })
            return true
        },
        [items, update],
    )

    const setQuantity = useCallback(
        (productId, quantity) => {
            update((current) =>
                current.map((item) =>
                    item.product_id === productId
                        ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
                        : item,
                ),
            )
        },
        [update],
    )

    const removeItem = useCallback(
        (productId) => update((current) => current.filter((item) => item.product_id !== productId)),
        [update],
    )

    const clear = useCallback(() => update(() => []), [update])

    const value = useMemo(
        () => ({
            items,
            count: items.reduce((sum, item) => sum + item.quantity, 0),
            addItem,
            setQuantity,
            removeItem,
            clear,
        }),
        [items, addItem, setQuantity, removeItem, clear],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}