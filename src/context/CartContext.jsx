import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import useAuth from '@/hooks/useAuth'

export const CartContext = createContext(null)

const STORAGE_PREFIX = 'brava.cart.'

export function lineKey(productId, size) {
    return size ? `${productId}:${size}` : String(productId)
}

function normalize(items) {
    return items.map((item) => ({
        ...item,
        size: item.size ?? null,
        key: item.key ?? lineKey(item.product_id, item.size),
    }))
}

function readCart(key) {
    if (!key) return []
    try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
        return Array.isArray(parsed) ? normalize(parsed) : []
    } catch {
        return []
    }
}

function writeCart(key, items) {
    try {
        if (items.length) localStorage.setItem(key, JSON.stringify(items))
        else localStorage.removeItem(key)
    } catch {
        // Ignore quota / private-mode failures; cart still works in-memory.
    }
}

/**
 * The member's cart: [{ key, product_id, size, name, unit_price_cents, quantity, stock }].
 * Saved per member in localStorage, only as a convenience: the API recomputes
 * prices and checks the stock of each size when the order is placed (RN-17, RN-20).
 */
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
        (product, size = null) => {
            const key = lineKey(product.id, size)
            const stock = size
                ? (product.sizes?.find((item) => item.size === size)?.stock ?? 0)
                : product.stock
            const line = items.find((item) => item.key === key)
            if (stock <= 0 || (line && line.quantity >= stock)) return false

            update((current) => {
                const fresh = {
                    key,
                    product_id: product.id,
                    size,
                    name: product.name,
                    unit_price_cents: product.price_cents,
                    stock,
                }
                if (!current.some((item) => item.key === key)) {
                    return [...current, { ...fresh, quantity: 1 }]
                }
                return current.map((item) =>
                    item.key === key ? { ...item, ...fresh, quantity: item.quantity + 1 } : item,
                )
            })
            return true
        },
        [items, update],
    )

    const setQuantity = useCallback(
        (key, quantity) => {
            update((current) =>
                current.map((item) =>
                    item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item,
                ),
            )
        },
        [update],
    )

    const removeItem = useCallback(
        (key) => update((current) => current.filter((item) => item.key !== key)),
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