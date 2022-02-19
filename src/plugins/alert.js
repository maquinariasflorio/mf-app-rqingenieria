import Vue from 'vue'

Vue.prototype.$alert = function(message = '', color = 'success', timeout = 4000) {

    this.$store.commit('alert/setProp', {
        message,
        color,
        timeout,
        show: true,
    } )

}
