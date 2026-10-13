import { apiRequest, buildQuery } from './api'

export function placeOrder(items) {
    return apiRequest('/orders', {
        method: 'POST',
        body: {
            items: items.map(({ product_id, size, quantity }) =>
                size ? { product_id, size, quantity } : { product_id, quantity },
            ),
        },
    })
}

export function listMyOrders({ page = 1, size = 10, signal } = {}) {
    return apiRequest(`/orders/me${buildQuery({ page, size })}`, { signal })
}

export function cancelOrder(orderId) {
    return apiRequest(`/orders/${orderId}/cancel`, { method: 'POST' })
}