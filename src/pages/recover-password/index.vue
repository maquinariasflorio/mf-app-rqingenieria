<template>
    <v-container class="mf-page mf-page-recover-password">
        <v-container class="container-alert">
            <v-row justify="center">
                <v-col cols="12"
                       sm="9"
                       md="7"
                       lg="5"
                >
                    <v-alert v-model="showAlert"
                             color="red"
                             dismissible
                             outlined
                             text
                             type="error"
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
                        <v-card-title>Recuperar Contraseña</v-card-title>

                        <v-card-text>
                            <p class="instructions">
                                Ingrese su RUT y luego presione el botón para enviarle un correo con el código de autorización para la recuperación de su contraseña.
                            </p>

                            <v-form v-model="validForm">
                                <v-text-field v-model="formData.rut"
                                              :rules="$rut.rules"
                                              label="RUT"
                                              autofocus
                                              :disabled="loading"
                                              @input="formData.rut = $rut.parse($event)"
                                              @keypress="$rut.keypress"
                                />

                                <v-btn class="btn-get-code"
                                       color="primary"
                                       block
                                       :disabled="!validForm || loading"
                                       @click="submit"
                                >
                                    Obtener código de autorización
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
import { Error } from './../../static/errors'
import { GraphqlTypename } from './../../static/errors/graphql_typename'

export default {
    layout : 'login',
    auth   : 'guest',

    data() {

        return {
            loading   : false,
            validForm : false,
            formData  : {
                rut: '',
            },

            showAlert    : false,
            alertMessage : '',
        }

    },

    methods: {
        submit() {

            if (this.validForm) {

                this.loading = true
                this.showAlert = false

                this.$apollo.query( {
                    query: gql`
                        query getRecoverCode($form: RecoverCodeInput!) {
                            getRecoverCode(form: $form) {
                                __typename
                            }
                        }
                    `,

                    variables: {
                        form: this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getRecoverCode } } ) => {

                        if (getRecoverCode.__typename === GraphqlTypename.OK) {

                            this.$router.push( { name: 'recover-password-confirm-rut', params: { rut: this.formData.rut } } )

                        }
                        else {

                            switch (getRecoverCode.__typename) {

                                case GraphqlTypename.USER_NOT_FOUND:
                                    this.alertMessage = Error.UNKNOWN_USER
                                    this.showAlert = true

                                    break
                                case GraphqlTypename.INACTIVE_USER:
                                    this.alertMessage = Error.INACTIVE_USER
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
