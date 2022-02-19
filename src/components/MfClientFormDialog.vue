<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-client-form-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-client-form-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>{{ isNew ? 'Nuevo Cliente' : 'Editar Cliente' }}</v-toolbar-title>
                    <v-spacer />

                    <v-toolbar-items>
                        <v-btn dark text :disabled="loading" @click="onSave">
                            Guardar
                        </v-btn>
                    </v-toolbar-items>

                </v-toolbar>

            </v-card-title>


            <!-- Body -->
            <v-card-text>

                <v-form ref="form" v-model="validForm">

                    <div class="text-overline">
                        Datos del Cliente
                    </div>
                    <v-divider />

                    <v-text-field v-model="formData.name"
                                  label="Nombre"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El nombre es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.paymentCondition"
                                  label="Condición de pago"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La condición de pago es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-expansion-panels :disabled="loading">
                        <v-expansion-panel>
                            <v-expansion-panel-header>
                                <v-row align="center">
                                    <v-col cols="auto">
                                        Receptores de Estado de Pago
                                    </v-col>

                                    <v-spacer />

                                    <v-col cols="auto">
                                        <v-btn color="primary" small :disabled="loading" @click.stop="onAddReceiver">
                                            Agregar
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-header>

                            <v-expansion-panel-content>

                                <v-row v-for="(receiver, index) of formData.receivers" :key="index" class="receiver-row">
                                    <v-col>
                                        <v-text-field :value="formData.receivers[index]"
                                                      label="Correo Electrónico"
                                                      :disabled="loading"
                                                      :rules="emailRules"
                                                      @input="$set(formData.receivers, index, $event)"
                                        />
                                    </v-col>

                                    <v-col cols="auto">
                                        <v-btn icon color="error" :disabled="loading" @click="onDeleteReceiver(index)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>

                    <div class="text-overline sub-title">
                        Datos de Facturación
                    </div>
                    <v-divider />

                    <v-text-field v-model="formData.billing.rut"
                                  label="RUT"
                                  :rules="$rut.rules"
                                  :disabled="loading"
                                  @input="formData.billing.rut = $rut.parse($event)"
                                  @keypress="$rut.keypress"
                    />

                    <v-text-field v-model="formData.billing.name"
                                  label="Nombre"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El nombre es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.billing.category"
                                  label="Giro"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El giro es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.billing.address"
                                  label="Dirección"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La dirección es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.billing.phone"
                                  label="Teléfono"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La teléfono es requerido' ]"
                    />
                </v-form>

            </v-card-text>
        </v-card>

    </v-dialog>
</template>

<script>
import gql from 'graphql-tag'
import { Error } from './../static/errors'
import { GraphqlTypename } from './../static/errors/graphql_typename'
import { emailRules } from './../static/rules/email'

export default {
    name: 'MfClientFormDialog',

    props: {
        value: {
            require : true,
            type    : Boolean,
        },

        data: {
            require : true,
            type    : Object,
            default : () => ( {} ),
        },

        isNew: {
            require : true,
            type    : Boolean,
        },
    },

    data() {

        return {
            validForm : false,
            formData  : {
                billing: {
                },
            },

            loading: false,

            emailRules,
        }

    },

    watch: {
        data(newValue) {

            this.formData = JSON.parse(JSON.stringify(newValue) )

        },
    },

    methods: {
        onSave() {

            if (this.$refs.form.validate() ) {

                if (this.isNew)
                    this.create()
                else
                    this.update()

            }

        },

        create() {

            this.loading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: ClientInput!) {
                    createClient(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { createClient } } ) => {

                    this.responseParser(createClient.__typename)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        update() {

            this.loading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: UpdateClientInput!) {
                    updateClient(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { updateClient } } ) => {

                    this.responseParser(updateClient.__typename)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        onAddReceiver() {

            this.formData.receivers.push('')

        },

        onDeleteReceiver(index) {

            this.formData.receivers.splice(index, 1)

        },

        responseParser(typename) {

            switch (typename) {

                case GraphqlTypename.OK:
                    this.$emit('save')
                    this.$emit('input', false)

                    break

                case GraphqlTypename.CLIENT_NOT_FOUND:
                    this.$emit('save', Error.UNKNOWN_CLIENT)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },

    },
}
</script>
