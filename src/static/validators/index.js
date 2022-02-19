import validator from 'validator'

export function validateCode(code) {

    if (!validator.isLength(code, { min: 6, max: 6 } ) )
        return 'El código debe ser de 6 dígitos.'

    return true

}

export function validateEmail(email = '') {

    if (!validator.isEmail(email) )
        return 'El correo electrónico ingresado no posee el formato correcto.'

    return true

}

export function validatePassword(password) {

    const passwordCriterias = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }

    if (!validator.isStrongPassword(password, passwordCriterias) )
        return 'La contraseña no cumple los criterios.'

    return true

}

export function validateConfirmPassword(newPassword, confirmPassword) {

    return (newPassword !== confirmPassword) ? 'Las contraseñas no coinciden.' : true

}
