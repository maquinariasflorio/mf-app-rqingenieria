export const state = () => ( {
    show    : false,
    timeout : 4000,
    color   : 'success',
    message : '',
} )

export const mutations = {
    setProp(state, props) {

        Object.entries(props).forEach( ( [ key, value ] ) => {

            state[key] = value

        } )

    },
}
