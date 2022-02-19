<template>
    <v-container class="mf-component mf-component-logo">
        <v-row justify="center">
            <v-col cols="5"
                   sm="3"
                   lg="2"
            >
                <img :src="_url"
                     class="logo"
                >
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'MfLogo',

    computed: {
        _url() {

            return process.env.NUXT_ENV_LOGO_BASE64

        },
    },
}
</script>
