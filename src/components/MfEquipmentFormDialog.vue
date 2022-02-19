<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-equipment-form-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-equipment-form-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>{{ isNew ? 'Nuevo Equipo' : 'Editar Equipo' }}</v-toolbar-title>
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

                    <v-select v-model="formData.type"
                              :items="types"
                              label="Tipo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo es requerido' ]"
                    />

                    <v-text-field v-model="formData.code"
                                  label="Código"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El código es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.name"
                                  label="Nombre"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El nombre es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.brand"
                                  label="Marca"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La marca es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.model"
                                  label="Modelo"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El modelo es requerido' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.patent"
                                  label="Patente"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La patente es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field :value="formData.year"
                                  label="Año"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El año es requerido' ]"
                                  @input="formData.year = parseFloat($event)"
                    />

                    <v-text-field v-if="isTruck"
                                  :value="formData.volume"
                                  label="Volumen"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El volumen es requerido' ]"
                                  @input="formData.volume = parseFloat($event)"
                    />

                    <v-select v-if="!isTruckOrPickup"
                              v-model="formData.maintenanceClass"
                              :items="maintenanceClasses"
                              label="Clase de Mantenimiento"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La clase es requerida' ]"
                    />
                    <p v-if="!isTruckOrPickup">
                        Clases de Mantenimiento:
                        <br>Clase A: 4 tramos cada 250hrs.
                        <br>Clase B: 3 tramos cada 500hrs.
                    </p>

                </v-form>

            </v-card-text>
        </v-card>

    </v-dialog>
</template>

<script>
import gql from 'graphql-tag'
import { Error } from './../static/errors'
import { GraphqlTypename } from './../static/errors/graphql_typename'

export const MachineryType = {
    TRUCK  : 'TRUCK',
    PICKUP : 'PICKUP',
    OTHER  : 'OTHER',
}

export const MachineryTypes = [
    { label: 'CAMIÓN', value: 'TRUCK' },
    { label: 'CAMIONETA', value: 'PICKUP' },
    { label: 'MAQUINARIA', value: 'OTHER' },
]

export const MaintenanceClasses = [
    { label: 'CLASE A | 4x250', value: 'CLASS_A' },
    { label: 'CLASE B | 3x500', value: 'CLASS_B' },
]

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

            types: MachineryTypes,

            maintenanceClasses: MaintenanceClasses,
        }

    },

    computed: {

        isTruck() {

            return this.formData.type === 'TRUCK'

        },

        isTruckOrPickup() {

            return this.formData.type === 'TRUCK' || this.formData.type === 'PICKUP'

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
                mutation: gql`mutation ($form: EquipmentInput!) {
                    createEquipment(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { createEquipment } } ) => {

                    this.responseParser(createEquipment.__typename)
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
                mutation: gql`mutation ($form: UpdateEquipmentInput!) {
                    updateEquipment(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { updateEquipment } } ) => {

                    this.responseParser(updateEquipment.__typename)
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

                case GraphqlTypename.EQUIPMENT_ALREADY_EXISTS:
                    this.$emit('save', Error.EQUIPMENT_ALREADY_EXISTS)

                    break

                case GraphqlTypename.CODE_ALREADY_EXISTS:
                    this.$emit('save', Error.CODE_ALREADY_EXISTS)

                    break

                case GraphqlTypename.PATENT_ALREADY_EXISTS:
                    this.$emit('save', Error.PATENT_ALREADY_EXISTS)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },
    },
}
</script>
