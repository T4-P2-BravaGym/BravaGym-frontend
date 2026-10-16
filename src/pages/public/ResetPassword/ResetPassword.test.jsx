import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import { confirmPasswordReset } from '@/services/auth'
import ResetPassword from './ResetPassword'
import { AuthContext } from '@/context/AuthContext'

vi.mock('@/services/auth', () => ({ confirmPasswordReset: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  window.history.replaceState(null, '', '/nueva-contrasena?from=email#token=demo-token')
})
function setup() { return render(<StrictMode><MemoryRouter><ResetPassword /></MemoryRouter></StrictMode>) }
async function fill(password = 'NewPassword2026!', repeat = password) {
  await userEvent.type(screen.getByLabelText('Nueva contraseña', { exact: true }), password)
  await userEvent.type(screen.getByLabelText('Repite la nueva contraseña'), repeat)
}

test('missing token offers a new link without a password form', () => {
  window.history.replaceState(null, '', '/nueva-contrasena')
  setup()
  expect(screen.getByRole('alert')).toHaveTextContent('Solicita un nuevo enlace')
  expect(screen.getByRole('link', { name: 'Solicitar otro enlace' })).toHaveAttribute('href', '/recuperar-contrasena')
  expect(screen.queryByLabelText('Nueva contraseña', { exact: true })).not.toBeInTheDocument()
})

test('StrictMode preserves token in memory, removes URL token, and success clears form', async () => {
  confirmPasswordReset.mockResolvedValue(null)
  setup()
  expect(window.location.hash).toBe('')
  expect(window.location.search).toBe('?from=email')
  await fill()
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
  expect(confirmPasswordReset).toHaveBeenCalledWith('demo-token', 'NewPassword2026!')
  expect(await screen.findByRole('status')).toHaveTextContent('contraseña se ha cambiado')
  expect(screen.queryByLabelText('Nueva contraseña', { exact: true })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute('href', '/entrar')
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toMatch(/demo-token|NewPassword/)
})

test.each([
  ['short', 'short', 'al menos 8'],
  ['😀'.repeat(4), '😀'.repeat(4), 'al menos 8'],
  ['NewPassword2026!', 'DifferentPassword2026!', 'no coinciden'],
  ['ñ'.repeat(37), 'ñ'.repeat(37), '72 bytes'],
])('invalid password is rejected before calling API: %s', async (password, repeat, message) => {
  setup()
  await fill(password, repeat)
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
  expect(screen.getByRole('alert')).toHaveTextContent(message)
  expect(confirmPasswordReset).not.toHaveBeenCalled()
})

test('invalid token shows a new-link action and removes the secret form', async () => {
  confirmPasswordReset.mockRejectedValue(Object.assign(new Error('El enlace no es válido o ha caducado.'), { status: 400 }))
  setup()
  await fill()
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('caducado')
  expect(screen.getByRole('link', { name: 'Solicitar otro enlace' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Nueva contraseña', { exact: true })).not.toBeInTheDocument()
})

test('network failure preserves token for retry and prevents duplicate submission', async () => {
  let reject
  confirmPasswordReset.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail }))
  setup()
  await fill()
  const form = screen.getByRole('button', { name: 'Guardar contraseña' }).closest('form')
  fireEvent.submit(form)
  fireEvent.submit(form)
  expect(confirmPasswordReset).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
  reject(new Error('Sin conexión'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión')
  confirmPasswordReset.mockResolvedValue(null)
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
  expect(await screen.findByRole('status')).toBeInTheDocument()
  expect(confirmPasswordReset).toHaveBeenLastCalledWith('demo-token', 'NewPassword2026!')
})


test('successful recovery clears an existing local session before returning to login', async () => {
  const clearSession = vi.fn()
  confirmPasswordReset.mockResolvedValue(null)
  render(<AuthContext.Provider value={{ clearSession }}><MemoryRouter><ResetPassword /></MemoryRouter></AuthContext.Provider>)
  await fill()
  await userEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
  await screen.findByRole('status')
  expect(clearSession).toHaveBeenCalledTimes(1)
})
