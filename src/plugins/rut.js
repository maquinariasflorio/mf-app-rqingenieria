import Vue from 'vue'
import { formatRut, validateRut } from 'rutlib'

function keypress(evt) {

    if (!/^[0-9kK]$/.test(evt.key) )
        evt.preventDefault()

}

function parse(value) {

    return formatRut(value)

}

const rules = [
    (v) => !!v || 'RUT es requerido',

    (v) => validateRut(v) || 'Rut inválido',
]


Vue.prototype.$rut = {
    keypress,
    parse,
    rules,
}
