import { apiRequest, buildQuery } from './api'

export function listProducts({ category_id, min_price, max_price, q, sort, page = 1, size = 20, signal } = {}) {
    return apiRequest(`/products${buildQuery({ category_id, min_price, max_price, q, sort, page, size })}`, {
        auth: false,
        signal,
    })
}

export function listProductCategories({ signal } = {}) {
    return apiRequest('/product-categories', { auth: false, signal })
}