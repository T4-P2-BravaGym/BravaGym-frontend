const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const MAX_NAME_LENGTH = 80
const MAX_PHONE_LENGTH = 20
const NAME_PATTERN = /^[\p{L}\s'-]+$/u

function checkName(value, emptyMessage) {
    const name = value.trim()

    if (name.length === 0) {
        return emptyMessage
    }
    if (name.length > MAX_NAME_LENGTH) {
        return `Puede tener como máximo ${MAX_NAME_LENGTH} caracteres.`
    }
    if (!NAME_PATTERN.test(name)) {
        return 'Usa solo letras, espacios, guiones o apóstrofos.'
    }
}

export function validateRegister(values) {
    const errors = {}

    const firstNameError = checkName(values.first_name, 'Escribe tu nombre.')
    if (firstNameError) errors.first_name = firstNameError

    const lastNameError = checkName(values.last_name, 'Escribe tu apellido.')
    if (lastNameError) errors.last_name = lastNameError

    if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = 'Escribe un email válido, por ejemplo ana@correo.com'
    }

    if (values.password.length < MIN_PASSWORD_LENGTH) {
        errors.password = `La contraseña necesita al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }

    if (values.phone.trim().length > MAX_PHONE_LENGTH) {
        errors.phone = `El teléfono puede tener como máximo ${MAX_PHONE_LENGTH} caracteres.`
    }

    return errors
}