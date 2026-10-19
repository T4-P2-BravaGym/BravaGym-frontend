import { ApiError } from '@/services/api'

const OVERLAP_ERROR = 'Esta franja se solapa con otra de tus sesiones. Elige otra hora.'
const NO_PT_TYPE_ERROR = 'No hay un tipo de clase de entrenamiento personal activo. Avisa a administración.'
const GENERIC_SAVE_ERROR = 'No se han podido abrir las franjas. Inténtalo de nuevo.'
const GENERIC_CANCEL_ERROR = 'No se ha podido cancelar la franja. Inténtalo de nuevo.'

export const SKIP_REASONS = {
    overlap: 'se solapa con otra de tus sesiones',
    past: 'ya ha pasado',
}

export function plural(count, one, many) {
    return count === 1 ? one : many
}

export function isBooked(slot) {
    return typeof slot.free_spots === 'number' && slot.free_spots === 0
}

export function saveErrorMessage(error) {
    if (!(error instanceof ApiError)) {
        return { title: 'Error', text: GENERIC_SAVE_ERROR }
    }
    if (error.status === 404) {
        return { title: 'Falta configuración', text: error.detail || NO_PT_TYPE_ERROR }
    }
    if (error.status === 409) {
        return { title: 'Horario ocupado', text: error.detail || OVERLAP_ERROR }
    }
    if (error.status === 422) {
        return {
            title: 'Datos no válidos',
            text: error.detail || 'Revisa los días, las horas y las fechas e inténtalo de nuevo.',
        }
    }
    return { title: 'No se pudo guardar', text: error.detail || GENERIC_SAVE_ERROR }
}

export function cancelErrorMessage(error) {
    if (!(error instanceof ApiError)) {
        return { title: 'Error', text: GENERIC_CANCEL_ERROR }
    }
    if (error.status === 403) {
        return { title: 'Sin permiso', text: error.detail || 'No puedes cancelar una franja de otra entrenadora.' }
    }
    return { title: 'No se pudo cancelar', text: error.detail || GENERIC_CANCEL_ERROR }
}