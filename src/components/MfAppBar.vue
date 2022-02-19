<template>
    <v-app-bar elevation="4" color="primary" class="mf-component mf-component-app-bar">
        <v-app-bar-nav-icon color="white" @click="$emit('update:navbar', !navbar)" />
        <v-toolbar-title class="app-bar-title">
            {{ title }}
        </v-toolbar-title>
    </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'MfAppBar',

    props: {
        navbar: {
            type    : Boolean,
            default : false,
        },
    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),
    },
}
</script>
