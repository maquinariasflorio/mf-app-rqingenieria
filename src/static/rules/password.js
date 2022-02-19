import { validatePassword } from '../validators'

export const passwordRules = [
    (v) => !!v || 'Contraseña es requerida',

    (v) => validatePassword(v),
]
