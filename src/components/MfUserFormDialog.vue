<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-user-form-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-user-form-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>{{ isNew ? 'Nuevo Usuario' : 'Editar Usuario' }}</v-toolbar-title>
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

                    <v-text-field v-model="formData.rut"
                                  label="RUT"
                                  :rules="$rut.rules"
                                  :disabled="!isNew || (isNew && loading)"
                                  @input="formData.rut = $rut.parse($event)"
                                  @keypress="$rut.keypress"
                    />

                    <v-text-field v-model="formData.name"
                                  label="Nombre"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El nombre es requerido' ]"
                    />

                    <v-text-field v-model="formData.email"
                                  label="Correo Electrónico"
                                  :disabled="loading"
                                  :rules="emailRules"
                    />

                    <v-select v-model="formData.role"
                              :items="roles"
                              label="Rol"
                              item-text="label"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El rol es requerido' ]"
                    />

                    <mf-signature-pad v-if="showSignaturePad"
                                      ref="signaturePad"
                                      label="Firma"
                                      :image="formData.signature"
                                      :disabled="loading"
                                      :rules="[ v => !!v || 'La firma es requerida' ]"
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
    name: 'MfUserFormDialog',

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

        roles: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        isNew: {
            require : true,
            type    : Boolean,
        },
    },

    data() {

        return {
            validForm : false,
            formData  : {},
            loading   : false,

            emailRules,
        }

    },

    computed: {
        showSignaturePad() {

            const role = this.roles.find( (role) => role._id === this.formData.role)

            return role && (role.name === 'operator' || role.name === 'construction_manager')

        },
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
                mutation: gql`mutation ($form: UserInput!) {
                    createUser(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        ...this.formData,
                        signature: this.showSignaturePad ? this.$refs.signaturePad.getValue() : null,
                    },
                },
            } )
                .then( ( { data: { createUser } } ) => {

                    this.responseParser(createUser.__typename)
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
                mutation: gql`mutation ($form: UpdateUserInput!) {
                    updateUser(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        ...this.formData,
                        signature: this.showSignaturePad ? this.$refs.signaturePad.getValue() : null,
                    },
                },
            } )
                .then( ( { data: { updateUser } } ) => {

                    this.responseParser(updateUser.__typename)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        responseParser(typename) {

            switch (typename) {

                case GraphqlTypename.OK:
                    this.$emit('save')
                    this.$emit('input', false)

                    break

                case GraphqlTypename.USER_NOT_FOUND:
                    this.$emit('save', Error.UNKNOWN_USER)

                    break

                case GraphqlTypename.USER_ALREADY_EXISTS:
                    this.$emit('save', Error.USER_ALREADY_EXISTS)

                    break

                case GraphqlTypename.IMMUTABLE_USER:
                    this.$emit('save', Error.IMMUTABLE_USER)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },
    },
}
</script>
