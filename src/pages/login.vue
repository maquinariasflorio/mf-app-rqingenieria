<template>
    <v-container class="mf-page mf-page-login">
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
                        <v-card-title>Inicio de Sesión</v-card-title>

                        <v-card-text>
                            <v-form v-model="validForm">
                                <v-text-field v-model="formData.rut"
                                              :rules="$rut.rules"
                                              label="RUT"
                                              autofocus
                                              @input="formData.rut = $rut.parse($event)"
                                              @keypress="$rut.keypress"
                                />

                                <v-text-field v-model="formData.password"
                                              :rules="[v => !!v || 'Contraseña es requerida']"
                                              type="password"
                                              label="Contraseña"
                                              class="input-password"
                                              @keypress.enter="submit"
                                />

                                <v-btn class="btn-login"
                                       color="primary"
                                       block
                                       :disabled="!validForm || loading"
                                       @click="submit"
                                >
                                    Ingresar
                                </v-btn>

                                <v-btn class="btn-recover-password"
                                       color="primary"
                                       plain
                                       block
                                       :disabled="loading"
                                       @click="recoverPassword"
                                >
                                    Recuperar contraseña
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
import { Error } from './../static/errors'

export default {
    layout : 'login',
    auth   : 'guest',

    data() {

        return {
            loading   : false,
            validForm : false,
            formData  : {
                rut      : '',
                password : '',
            },

            showAlert    : false,
            alertMessage : '',
        }

    },

    methods: {

        async submit() {

            if (this.validForm) {

                this.loading = true
                this.showAlert = false

                try {

                    await this.$auth.login( { data: this.formData } )
                    this.$router.push( { name: this.$auth.user.role.initialView } )

                }
                catch (error) {

                    if (error.response) {

                        switch (error.response.status) {

                            case this.$httpStatus.NOT_FOUND: {

                                this.alertMessage = Error.UNKNOWN_USER
                                this.showAlert = true

                                break

                            }

                            case this.$httpStatus.FORBIDDEN: {

                                this.alertMessage = Error.INACTIVE_USER
                                this.showAlert = true

                                break

                            }

                            case this.$httpStatus.UNAUTHORIZED: {

                                this.alertMessage = Error.WRONG_PASSWORD
                                this.showAlert = true

                                break

                            }

                            default: {

                                this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                                this.showAlert = true

                            }

                        }

                    }
                    else {

                        this.alertMessage = Error.DEFAULT_ERROR_MESSAGE
                        this.showAlert = true

                    }

                    this.loading = false

                }

            }

        },

        recoverPassword() {

            this.$router.push('/recover-password')

        },
    },
}
</script>
