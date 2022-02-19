<template>
    <v-navigation-drawer :value="value"
                         absolute
                         temporary
                         class="mf-component mf-component-navbar"
                         @input="$emit('input', $event)"
    >
        <v-list>
            <v-list-item link>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        {{ user.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="text-overline">
                        {{ user.role ? user.role.label : '' }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>

        <v-divider />

        <v-list nav dense>
            <mf-navbar-item-group v-model="selectedItem" :items="items" />
        </v-list>

        <template #append>
            <div class="pa-2">
                <v-btn block color="primary" text @click="changePasswordConfirmation = true">
                    Cambiar Contraseña
                </v-btn>
            </div>

            <div class="pa-2">
                <v-btn block color="primary" @click="logout">
                    Cerrar Sesión
                </v-btn>
            </div>

            <div class="caption text-center">
                ver.{{ version }}
            </div>
        </template>

        <v-dialog v-model="changePasswordConfirmation" persistent width="auto">
            <v-card elevation="4" :loading="loading">
                <v-card-title>Cambiar Contraseña</v-card-title>

                <v-card-text>
                    <v-form ref="form">

                        <v-text-field v-model="currentPassword"
                                      label="Contraseña Actual"
                                      type="password"
                                      :disabled="loading"
                                      :rules="[v => !!v || 'Contraseña Actual es requerida']"
                        />

                        <v-text-field v-model="newPassword"
                                      label="Nueva Contraseña"
                                      type="password"
                                      :disabled="loading"
                                      :rules="[v => !!v || 'Nueva Contraseña es requerida']"
                        />

                        <v-text-field v-model="confirmPassword"
                                      label="Confirmar Contraseña"
                                      type="password"
                                      :disabled="loading"
                                      :rules="[v => !!v || 'Confirmar Contraseña es requerida',
                                               v => v === newPassword || 'Las contraseñas no coinciden']"
                        />

                        <v-btn color="primary" outlined :disabled="loading" @click="changePasswordConfirmation = false">
                            Cancelar
                        </v-btn>

                        <v-btn color="primary" :disabled="loading" @click="confirmChangePassword">
                            Confirmar
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="logoutConfirmation" width="auto">
            <v-card elevation="4">
                <v-card-title>Cerrar Sesión</v-card-title>

                <v-card-text>
                    <p>¿Está seguro que desea cerrar sesión?</p>

                    <v-btn color="primary" outlined @click="logoutConfirmation = false">
                        Cancelar
                    </v-btn>

                    <v-btn color="primary" @click="confirmLogout">
                        Confirmar
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-navigation-drawer>
</template>

<script>
import gql from 'graphql-tag'
import pkg from '@@/package.json'
import { Error } from './../static/errors'
import { Message } from './../static/messages'

export default {
    name: 'MfNavbar',

    props: {
        value: {
            type    : Boolean,
            default : false,
        },
    },

    data() {

        return {
            loading                    : false,
            version                    : pkg.version,
            selectedItem               : '',
            logoutConfirmation         : false,
            changePasswordConfirmation : false,
            currentPassword            : '',
            newPassword                : '',
            confirmPassword            : '',
        }

    },

    computed: {
        items() {

            return this.$auth.user.views

        },

        user() {

            return this.$auth.user

        },
    },

    mounted() {

        this.selectedItem = this.$store.state.navbar.name

    },

    methods: {
        logout() {

            this.logoutConfirmation = true

        },

        async confirmLogout() {

            this.logoutConfirmation = false
            await this.$auth.logout()
            this.$router.push('/login')

        },

        async confirmChangePassword() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                this.$apollo.mutate( {
                    mutation: gql`mutation ($form: ChangePasswordInput!) {
                    changePassword(form: $form) {
                        __typename
                    }
                }`,

                    variables: {
                        form: {
                            currentPassword : this.currentPassword,
                            newPassword     : this.newPassword,
                        },
                    },
                } )
                    .then( ( { data: { changePassword } } ) => {

                        if (changePassword.__typename === 'Ok') {

                            this.$alert(Message.PASSWORD_CHANGED)
                            this.currentPassword = ''
                            this.newPassword = ''
                            this.confirmPassword = ''
                            this.changePasswordConfirmation = false

                        }

                        if (changePassword.__typename === 'WrongCurrentPassword')
                            this.$alert(Error.WRONG_CURRENT_PASSWORD, 'error')

                        this.loading = false

                    } )
                    .catch( () => {

                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },
    },
}
</script>
