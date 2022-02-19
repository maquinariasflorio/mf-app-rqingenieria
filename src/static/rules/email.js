import { validateEmail } from '../validators'

export const emailRules = [
    (v) => !!v || 'Correo electrónico es requerido',

    (v) => validateEmail(v),
]
