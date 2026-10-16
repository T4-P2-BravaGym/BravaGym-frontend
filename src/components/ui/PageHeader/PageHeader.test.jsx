import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
    it('shows the eyebrow, the title as the page h1 and the lead', () => {
        render(
            <PageHeader
                eyebrow="Panel de entrenadora"
                title="Mis clases"
                lead="Crea, edita o cancela tus clases de grupo."
            />,
        )

        expect(screen.getByRole('heading', { level: 1, name: 'Mis clases' })).toBeInTheDocument()
        expect(screen.getByText('Panel de entrenadora')).toBeInTheDocument()
        expect(screen.getByText('Crea, edita o cancela tus clases de grupo.')).toBeInTheDocument()
    })

    it('puts the action inside the header', () => {
        const { container } = render(
            <PageHeader title="Mis clases" action={<button type="button">Nueva clase</button>} />,
        )

        expect(container.querySelector('header')).toContainElement(
            screen.getByRole('button', { name: 'Nueva clase' }),
        )
    })

    it('shows only the title when there is no eyebrow, lead or action', () => {
        const { container } = render(<PageHeader title="Pagos" />)

        expect(container.querySelector('header')).toHaveTextContent(/^Pagos$/)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})