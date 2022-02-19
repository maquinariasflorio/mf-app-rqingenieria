<template>
    <v-app class="mf-layout mf-layout-default">
        <v-main class="blue-grey lighten-5">
            <mf-app-bar :navbar.sync="navbar" />

            <div class="mf-page-wrapper">
                <div class="container container--fluid">
                    <Nuxt />
                </div>
            </div>
        </v-main>

        <v-footer class="blue-grey lighten-5">
            <v-spacer />
            <div class="caption">
                Todos los derechos reservados &copy; {{ new Date().getFullYear() }}
            </div>
            <v-spacer />
        </v-footer>

        <mf-navbar v-model="navbar" />

        <!--ALERTS-->
        <v-snackbar :value="alert.show"
                    :timeout="alert.timeout"
                    :color="alert.color"
                    absolute
                    centered
                    top
                    elevation="4"
                    class="mf-global-snackbar"
                    @input="$store.commit('alert/setProp', { show: false })"
        >
            {{ alert.message }}
        </v-snackbar>
    </v-app>
</template>

<script>
import MfAppBar from '../components/MfAppBar.vue'

export default {
    components: { MfAppBar },

    data() {

        return {
            navbar: false,
        }

    },

    computed: {

        alert() {

            return this.$store.state.alert

        },

    },
}
</script>
