import { ApiError } from '@/services/api'

const TITLES = {
    403: 'Sin permiso',
    404: 'Ya no existe',
    409: 'No se ha podido hacer',
    422: 'Revisa los datos',
}

export function adminErrorMessage(error, { fallback, invalidHint } = {}) {
    if (!(error instanceof ApiError)) return { title: 'Algo ha fallado', text: fallback }

    const isFieldError = error.status === 422 && !error.code
    return {
        title: TITLES[error.status] ?? 'Algo ha fallado',
        text: (isFieldError && invalidHint) || error.detail || fallback,
    }
}