import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MyPayments from './MyPayments'
import { validateCode } from '@/services/discountCodes'
import { ApiError } from '@/services/api'
import { checkoutPayment, listMyPayments, payPayment } from '@/services/payments'

vi.mock('@/services/discountCodes', () => ({ validateCode: vi.fn() }))
vi.mock('@/services/payments', async (importOriginal) => ({
  ...await importOriginal(),
  checkoutPayment: vi.fn(), listMyPayments: vi.fn(), payPayment: vi.fn(),
}))
const pending = {
  id: 29, status: 'pending', concept: 'subscription',
  base_amount_cents: 3000, final_amount_cents: 3000, created_at: '2026-10-19T10:00:00Z',
}
const page = (payment) => ({ items: [payment], total: 1, page: 1, size: 20 })
function mount(query = '') {
  return render(<MemoryRouter initialEntries={[`/mi-area/pagos${query}`]}><MyPayments /></MemoryRouter>)
}
beforeEach(() => {
  vi.resetAllMocks()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  listMyPayments.mockResolvedValue(page(pending))
})
afterEach(() => vi.unstubAllGlobals())

describe('HU-29 card checkout', () => {
  it('opens the URL from the API without simulating payment', async () => {
    const assign = vi.fn()
    vi.stubGlobal('window', { ...window, location: { ...window.location, assign } })
    checkoutPayment.mockResolvedValue({ checkout_url: 'https://checkout.stripe.com/c/pay/test' })
    mount()
    await userEvent.click(await screen.findByRole('button', { name: 'Pagar con tarjeta' }))
    expect(checkoutPayment).toHaveBeenCalledWith(29, { discountCode: undefined })
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/test')
    expect(payPayment).not.toHaveBeenCalled()
  })

  it('passes the validated discount to checkout', async () => {
    const assign = vi.fn()
    vi.stubGlobal('window', { ...window, location: { ...window.location, assign } })
    validateCode.mockResolvedValue({ code: 'BRAVA10', percent_off: 10 })
    checkoutPayment.mockResolvedValue({ checkout_url: 'https://checkout.stripe.com/c/pay/test' })
    mount()
    await userEvent.type(await screen.findByLabelText('Código de descuento'), 'brava10')
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    await screen.findByText('BRAVA10')
    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta' }))
    expect(checkoutPayment).toHaveBeenCalledWith(29, { discountCode: 'BRAVA10' })
  })

  it('shows 503 and preserves the simulated flow', async () => {
    checkoutPayment.mockRejectedValue(new ApiError(503, 'Stripe no está configurado.'))
    payPayment.mockResolvedValue({ ...pending, status: 'paid' })
    mount()
    await userEvent.click(await screen.findByRole('button', { name: 'Pagar con tarjeta' }))
    expect(await screen.findByText('Pago con tarjeta no disponible')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Pagar .*simulado/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, pagar' }))
    expect(payPayment).toHaveBeenCalledWith(29, { discountCode: undefined })
  })

  it.each(['success', 'cancel'])('reloads on %s without trusting the query as proof of payment', async (result) => {
    mount(`?stripe=${result}`)
    expect(await screen.findByRole('button', { name: 'Pagar con tarjeta' })).toBeInTheDocument()
    expect(listMyPayments).toHaveBeenCalled()
    expect(payPayment).not.toHaveBeenCalled()
    expect(checkoutPayment).not.toHaveBeenCalled()
    listMyPayments.mockResolvedValue(page({ ...pending, status: 'paid' }))
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar pagos' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Pagar con tarjeta' })).not.toBeInTheDocument())
    expect(await screen.findByText('Pagado')).toBeInTheDocument()
  })

  it('disables payment actions while checkout is in flight', async () => {
    checkoutPayment.mockReturnValue(new Promise(() => {}))
    mount()
    await userEvent.click(await screen.findByRole('button', { name: 'Pagar con tarjeta' }))
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Pagando…' })).toBeDisabled()
    expect(checkoutPayment).toHaveBeenCalledTimes(1)
  })
})
