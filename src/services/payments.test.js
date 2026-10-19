import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from './api'
import { checkoutPayment } from './payments'
vi.mock('./api', () => ({ apiRequest: vi.fn(), apiDownload: vi.fn(), buildQuery: vi.fn() }))
describe('checkoutPayment', () => {
  it('sends only the optional discount, never a client amount', async () => {
    await checkoutPayment(29, { discountCode: 'BRAVA10', amount: 1 })
    expect(apiRequest).toHaveBeenLastCalledWith('/payments/29/checkout', {
      method: 'POST', body: { discount_code: 'BRAVA10' }, signal: undefined,
    })
  })
  it('uses an empty body without a discount', async () => {
    await checkoutPayment(29)
    expect(apiRequest).toHaveBeenLastCalledWith('/payments/29/checkout', {
      method: 'POST', body: {}, signal: undefined,
    })
  })
})
