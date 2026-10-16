import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Field from './Field'

describe('Field', () => {
    it('shows and hides a revealable password', async () => {
        const user = userEvent.setup()
        render(<Field label="Contraseña" type="password" revealable />)
        const input = screen.getByLabelText('Contraseña')
        const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' })

        expect(input).toHaveAttribute('type', 'password')
        expect(toggle).toHaveAttribute('aria-pressed', 'false')

        await user.click(toggle)
        expect(input).toHaveAttribute('type', 'text')
        expect(toggle).toHaveAttribute('aria-pressed', 'true')

        await user.click(toggle)
        expect(input).toHaveAttribute('type', 'password')
    })

    it('has no eye button unless it is revealable', () => {
        render(<Field label="Contraseña" type="password" />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('links the error to the control', () => {
        render(<Field label="Email" error="Este email ya está registrado." />)
        const input = screen.getByLabelText('Email')

        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAccessibleDescription('Este email ya está registrado.')
    })
})