import { apiRequest, buildQuery } from './api'

export function listProducts({ category_id, min_price, max_price, q, sort, page = 1, size = 20, signal } = {}) {
    return apiRequest(`/products${buildQuery({ category_id, min_price, max_price, q, sort, page, size })}`, {
        auth: false,
        signal,
    })
}

export function listProductCategories({ signal } = {}) {
    return apiRequest('/product-categories', {
        auth: false,
        signal
    })
}

export function listAdminProducts({ category_id, q, status, page = 1, size = 20, signal } = {}) {
    return apiRequest(`/products/admin${buildQuery({ category_id, q, status, page, size })}`, {
        signal
    })
}

export function createProduct(body) {
    return apiRequest('/products', {
        method: 'POST',
        body })
}

export function updateProduct(productId, body) {
    return apiRequest(`/products/${productId}`, {
        method: 'PATCH',
        body
    })
}

export function deactivateProduct(productId) {
    return apiRequest(`/products/${productId}`, {
        method: 'DELETE'
    })
}

export function createCategory(body) {
    return apiRequest('/product-categories', {
        method: 'POST',
        body
    })
}

export function updateCategory(categoryId, body) {
    return apiRequest(`/product-categories/${categoryId}`, {
        method: 'PATCH',
        body
    })
}

export function deleteCategory(categoryId) {
    return apiRequest(`/product-categories/${categoryId}`, {
        method: 'DELETE'
    })
}