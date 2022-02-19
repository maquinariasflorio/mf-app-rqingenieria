<template>
    <v-app class="mf-layout mf-layout-login">
        <v-main class="blue-grey lighten-5">
            <v-container class="d-flex flex-column">
                <mf-logo />

                <Nuxt />
            </v-container>
        </v-main>

        <v-footer class="blue-grey lighten-5">
            <v-spacer />
            <div class="caption">
                Todos los derechos reservados &copy; {{ new Date().getFullYear() }}
            </div>
            <v-spacer />
        </v-footer>
    </v-app>
</template>
