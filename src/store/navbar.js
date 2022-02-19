export const state = () => ( {
    title: '',
} )

export const mutations = {
    setProp(state, props) {

        Object.entries(props).forEach( ( [ key, value ] ) => {

            state[key] = value

        } )

    },

    reset(state) {

        state.title = ''

    },
}

export const getters = {
    getTitle: (state) => {

        return state.title

    },
}
