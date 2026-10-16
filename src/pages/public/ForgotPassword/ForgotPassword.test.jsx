import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import { requestPasswordReset } from '@/services/auth'
import ForgotPassword from './ForgotPassword'

vi.mock('@/services/auth', () => ({ requestPasswordReset: vi.fn() }))
beforeEach(() => { vi.clearAllMocks() })
function setup() { return render(<MemoryRouter><ForgotPassword /></MemoryRouter>) }

test('valid email shows the same private confirmation and a login link', async () => {
  requestPasswordReset.mockResolvedValue({})
  setup()
  await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'demo@example.com')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))
  expect(requestPasswordReset).toHaveBeenCalledWith('demo@example.com')
  expect(await screen.findByRole('status')).toHaveTextContent('Si existe una cuenta activa')
  expect(screen.getByRole('link', { name: 'Volver a iniciar sesión' })).toHaveAttribute('href', '/entrar')
})

test('invalid email does not call the API', async () => {
  setup()
  await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'invalid')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))
  expect(screen.getByRole('alert')).toHaveTextContent('email válido')
  expect(requestPasswordReset).not.toHaveBeenCalled()
})

test('submission blocks duplicates, exposes network failure and permits retry', async () => {
  let reject
  requestPasswordReset.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail }))
  setup()
  await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'demo@example.com')
  const form = screen.getByRole('button', { name: 'Enviar enlace' }).closest('form')
  fireEvent.submit(form)
  expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
  fireEvent.submit(form)
  expect(requestPasswordReset).toHaveBeenCalledTimes(1)
  reject(new Error('Sin conexión'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión')
  requestPasswordReset.mockResolvedValue({})
  await userEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }))
  await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledTimes(2))
})
