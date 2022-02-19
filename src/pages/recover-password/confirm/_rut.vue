<template>
    <v-container class="mf-page mf-page-recover-password-confirm">
        <v-container class="container-alert">
            <v-row justify="center">
                <v-col cols="12"
                       sm="9"
                       md="7"
                       lg="5"
                >
                    <v-alert v-model="showAlert"
                             :color="alertColor"
                             dismissible
                             outlined
                             text
                             :type="alertType"
                    >
                        {{ alertMessage }}
                    </v-alert>
                </v-col>
            </v-row>
        </v-container>

        <v-container>
            <v-row justify="center">
                <v-col cols="12"
                       sm="9"
                       md="7"
                       lg="5"
                >
                    <v-card elevation="4" :loading="loading">
                        <v-card-title>Cambio de Contraseña</v-card-title>

                        <v-card-text>
                            <v-form v-model="validForm">
                                <v-text-field v-model="formData.password"
                                              label="Contraseña nueva"
                                              autofocus
                                              type="password"
                                              :disabled="loading"
                                              :rules="passwordRules"
                                />
                                <div class="help">
                                    <p>La contraseña debe cumplir:</p><ul><li>Largo min. 8 caracteres.</li><li>Al menos un caracter en mayúscula.</li><li>Al menos un caracter en minúscula.</li><li>Al menos un caracter numérico.</li></ul>
                                </div>

                                <v-text-field v-model="formData.confirmPassword"
                                              label="Confirmar contraseña"
                                              type="password"
                                              :disabled="loading"
                                              :rules="confirmPasswordRules"
                                              class="input-confirm-password"
                                />

                                <v-text-field v-model="formData.code"
                                              label="Código de autorización"
                                              :disabled="loading"
                                              :rules="[validateCode]"
                                              class="input-code"
                                />
                                <div class="help">
                                    <p>Su código de autorización fue enviado a su correo electrónico. Si no está en su bandeja de entrada, revise la carpeta de spam.</p>
                                </div>

                                <v-btn class="btn-change-password"
                                       color="primary"
                                       block
                                       :disabled="!validForm || loading"
                                       @click="submit"
                                >
                                    Cambiar contraseña
                                </v-btn>

                                <v-btn class="btn-back"
                                       color="primary"
                                       plain
                                       block
                                       :disabled="loading"
                                       @click="back"
                                >
                                    Volver
                                </v-btn>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import { Error } from './../../../static/errors'
import { GraphqlTypename } from './../../../static/errors/graphql_typename'
import { passwordRules } from './../../../static/rules/password'
import { validateConfirmPassword, validateCode } from './../../../static/validators'

export default {
    layout : 'login',
    auth   : 'guest',

    data() {

        return {
            loading   : false,
            validForm : false,
            formData  : {
                rut             : '',
                code            : '',
                password        : '',
                confirmPassword : '',
            },

            showAlert    : false,
            alertMessage : '',
            alertType    : 'error',
            alertColor   : 'red',

            passwordRules,
            validateCode,
        }

    },

    computed: {
        confirmPasswordRules() {

            return [
                (v) => validateConfirmPassword(v, this.formData.password),
            ]

        },
    },

    mounted() {

        this.formData.rut = this.$route.params.rut

    },

    methods: {
        submit() {

            if (this.validForm) {

                this.loading = true
                this.showAlert = false

                this.$apollo.mutate( {
                    mutation: gql`
                        mutation changePasswordWithAuthCode($form: NewPasswordInput!) {
                            changePasswordWithAuthCode(form: $form) {
                                __typename
                            }
                        }
                    `,

                    variables: {
                        form: this.formData,
                    },

                    fetchPolicy: 'no-cache',
                } )
                    .then( ( { data: { changePasswordWithAuthCode } } ) => {

                        if (changePasswordWithAuthCode.__typename === GraphqlTypename.OK) {

                            this.alertType = 'success'
                            this.alertColor = 'green'
                            this.alertMessage = 'Contraseña cambiada correctamente.'
                            this.showAlert = true

                            setTimeout(async() => {

                                await this.$auth.login( { data: {
                                    rut      : this.formData.rut,
                                    password : this.formData.password,
                                } } )
                                this.$router.push( { name: this.$auth.user.role.initialView } )

                            }, 3000)

                        }
                        else {

                            this.alertType = 'error'
                            this.alertColor = 'red'

                            switch (changePasswordWithAuthCode.__typename) {

                                case GraphqlTypename.USER_NOT_FOUND:
                                    this.alertMessage = Error.UNKNOWN_USER
                                    this.showAlert = true

                                    break
                                case GraphqlTypename.INACTIVE_USER:
                                    this.alertMessage = Error.INACTIVE_USER
                                    this.showAlert = true

                                    break
                                case GraphqlTypename.TOKEN_NOT_FOUND:
                                case GraphqlTypename.WRONG_CHANGE_PASSWORD_CODE:
                                    this.alertMessage = Error.WRONG_CODE
                                    this.showAlert = true

                                    break
                                default:
                                    this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                                    this.showAlert = true

                                    break

                            }

                            this.loading = false

                        }

                    } )
                    .catch( () => {

                        this.alertType = 'error'
                        this.alertColor = 'red'
                        this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                        this.showAlert = true
                        this.loading = false

                    } )

            }

        },

        back() {

            this.$router.push( { name: 'login' } )

        },
    },
}
</script>
