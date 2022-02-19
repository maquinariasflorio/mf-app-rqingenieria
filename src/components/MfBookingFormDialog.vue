<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-booking-form-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-booking-form-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>{{ isNew ? 'Nuevo Arriendo' : 'Editar Arriendo' }}</v-toolbar-title>
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

                    <div class="text-overline sub-title">
                        Datos del arriendo
                    </div>
                    <v-divider />

                    <v-select v-model="formData.type"
                              :items="types"
                              label="Tipo de Arriendo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de arriendo es requerido' ]"
                              @change="onTypeChange"
                    />
                    <p>
                        Tipos de Arriendos:<br>
                        Interna: maquinaria de la empresa.<br>
                        Externa: maquinaria de terceros.
                    </p>

                    <v-select v-if="isExternal"
                              v-model="formData.constructionManager"
                              :items="constructionManagers"
                              label="Jefe de Obra"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El jefe de obra es requerido' ]"
                    >

                        <template #item="{ item }">
                            {{ item.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-model="formData.client"
                              :items="clients"
                              label="Cliente"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El cliente es requerido' ]"
                    >

                        <template #item="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                    </v-select>


                    <v-expansion-panels :disabled="loading">
                        <v-expansion-panel>
                            <v-expansion-panel-header>
                                <v-row align="center">
                                    <v-col cols="auto">
                                        Máquinas
                                    </v-col>

                                    <v-spacer />

                                    <v-col cols="auto">
                                        <v-btn color="primary" small :disabled="loading" @click.stop="onAddMachinery">
                                            Agregar
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-header>

                            <v-expansion-panel-content>

                                <v-row v-for="(receiver, index) of formData.machines" :key="index" class="machinery-row">
                                    <v-col v-if="isExternal">
                                        <v-select :value="formData.machines[index].machineryType"
                                                  :items="MachineryTypes"
                                                  label="Tipo de Maquinaria"
                                                  item-text="label"
                                                  item-value="value"
                                                  :disabled="loading"
                                                  :rules="[ v => !!v || 'El tipo de maquinaria es requerido' ]"
                                                  @input="$set(formData.machines, index, { ...formData.machines[index], machineryType: $event})"
                                        />
                                    </v-col>


                                    <!-- MACHINERY -->
                                    <v-col>
                                        <v-select v-if="isInternal"
                                                  :value="formData.machines[index].equipment"
                                                  :items="equipments"
                                                  label="Maquinaria"
                                                  item-text="name"
                                                  item-value="_id"
                                                  :disabled="loading"
                                                  :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                                                  @change="onChangeEquipment($event, index)"
                                                  @input="$set(formData.machines, index, { ...formData.machines[index], equipment: $event})"
                                        >

                                            <template #item="{ item }">
                                                {{ item.code }} | {{ item.patent }} | {{ item.name }}
                                            </template>

                                            <template #selection="{ item }">
                                                {{ item.code }} | {{ item.patent }} | {{ item.name }}
                                            </template>

                                        </v-select>

                                        <v-text-field v-if="isExternal"
                                                      :value="formData.machines[index].equipment"
                                                      label="Maquinaria"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                                                      class="mf-to-uppercase"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], equipment: $event})"
                                        />
                                    </v-col>


                                    <!-- OPERATOR -->
                                    <v-col>
                                        <v-select v-if="isInternal"
                                                  :value="formData.machines[index].operator"
                                                  :items="operators"
                                                  label="Operador"
                                                  item-text="name"
                                                  item-value="_id"
                                                  :disabled="loading"
                                                  :rules="[ v => !!v || 'El operador es requerido' ]"
                                                  @input="$set(formData.machines, index, { ...formData.machines[index], operator: $event})"
                                        >

                                            <template #item="{ item }">
                                                {{ item.rut }} | {{ item.name }}
                                            </template>

                                            <template #selection="{ item }">
                                                {{ item.rut }} | {{ item.name }}
                                            </template>

                                        </v-select>

                                        <v-text-field v-if="isExternal"
                                                      :value="formData.machines[index].operator"
                                                      label="Operador"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El operador es requerido' ]"
                                                      class="mf-to-uppercase"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], operator: $event})"
                                        />
                                    </v-col>


                                    <v-col v-if="formData.machines[index].machineryType === 'OTHER'">
                                        <v-text-field :value="formData.machines[index].minHours"
                                                      label="Horas Mínimas"
                                                      type="number"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'Las horas mínimas son requeridas' ]"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], minHours: parseFloat($event)})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'OTHER'">
                                        <v-text-field :value="formData.machines[index].amountPerHour"
                                                      label="Monto por Hora"
                                                      type="number"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El monto por hora es requerido' ]"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], amountPerHour: parseFloat($event)})"
                                        />
                                    </v-col>

                                    <v-col v-if="isExternal && formData.machines[index].machineryType === 'TRUCK'">
                                        <v-text-field :value="formData.machines[index].volume"
                                                      label="Volumen m3"
                                                      type="number"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El volumen es requerido' ]"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], volume: parseFloat($event)})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'TRUCK'">
                                        <v-select :value="formData.machines[index].workCondition"
                                                  :items="workContidions"
                                                  label="Condición de Trabajo"
                                                  item-text="label"
                                                  item-value="value"
                                                  :disabled="loading"
                                                  :rules="[ v => !!v || 'La condición de trabajo es requerida' ]"
                                                  @input="$set(formData.machines, index, { ...formData.machines[index], workCondition: $event})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'TRUCK' && (formData.machines[index].workCondition === 'TRAVEL' || formData.machines[index].workCondition === 'BOTH')">
                                        <v-text-field :value="formData.machines[index].load"
                                                      label="Carga"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'La carga es requerida' ]"
                                                      class="mf-to-uppercase"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], load: $event})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'TRUCK' && (formData.machines[index].workCondition === 'TRAVEL' || formData.machines[index].workCondition === 'BOTH')">
                                        <v-text-field :value="formData.machines[index].origin"
                                                      label="Origen Carga"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El origen es requerido' ]"
                                                      class="mf-to-uppercase"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], origin: $event})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'TRUCK' && (formData.machines[index].workCondition === 'TRAVEL' || formData.machines[index].workCondition === 'BOTH')">
                                        <v-text-field :value="formData.machines[index].amountPerTravel"
                                                      label="Monto por Viaje"
                                                      type="number"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El monto es requerido' ]"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], amountPerTravel: parseFloat($event)})"
                                        />
                                    </v-col>

                                    <v-col v-if="formData.machines[index].machineryType === 'TRUCK' && (formData.machines[index].workCondition === 'DAY' || formData.machines[index].workCondition === 'BOTH')">
                                        <v-text-field :value="formData.machines[index].amountPerDay"
                                                      label="Monto por Jornada"
                                                      type="number"
                                                      :disabled="loading"
                                                      :rules="[ v => !!v || 'El monto es requerido' ]"
                                                      @input="$set(formData.machines, index, { ...formData.machines[index], amountPerDay: parseFloat($event)})"
                                        />
                                    </v-col>

                                    <v-col cols="auto">
                                        <v-btn icon
                                               color="error"
                                               :disabled="loading"
                                               @click="onDeleteMachine(index)"
                                        >
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>


                    <div class="text-overline sub-title">
                        Datos de la obra
                    </div>
                    <v-divider />

                    <v-text-field v-if="isExternal"
                                  v-model="formData.company"
                                  label="Compañía Externa"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La compañía es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-text-field v-model="formData.building"
                                  label="Obra"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La obra es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Término"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-text-field v-model="formData.address"
                                  label="Dirección"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'La dirección es requerida' ]"
                                  class="mf-to-uppercase"
                    />

                    <v-expansion-panels :disabled="loading">
                        <v-expansion-panel>
                            <v-expansion-panel-header>
                                <v-row align="center">
                                    <v-col cols="auto">
                                        Receptores
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
                                        <v-text-field :value="formData.receivers[index].email"
                                                      label="Correo Electrónico"
                                                      :disabled="!formData.receivers[index].editable || loading"
                                                      :rules="emailRules"
                                                      @input="$set(formData.receivers, index, { editable: true, email: $event})"
                                        />
                                    </v-col>

                                    <v-col cols="auto">
                                        <v-btn v-if="formData.receivers[index].editable"
                                               icon
                                               color="error"
                                               :disabled="loading"
                                               @click="onDeleteReceiver(index)"
                                        >
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>

                </v-form>

            </v-card-text>
        </v-card>

    </v-dialog>
</template>

<script>
import gql from 'graphql-tag'
import { Error } from '../static/errors'
import { GraphqlTypename } from '../static/errors/graphql_typename'
import { emailRules } from '../static/rules/email'
import { MachineryTypes } from './MfEquipmentFormDialog'

export const BookingTypes = {
    INTERNAL : 'INTERNAL',
    EXTERNAL : 'EXTERNAL',
}

export const BookingTypesAndLabels = [
    { label: 'INTERNA', value: 'INTERNAL' },
    { label: 'EXTERNA', value: 'EXTERNAL' },
]

export const TruckWorkConditionsTypes = {
    TRAVEL : 'TRAVEL',
    DAY    : 'DAY',
    BOTH   : 'BOTH',
}

export const TruckWorkConditions = [
    { label: 'POR VIAJE', value: 'TRAVEL' },
    { label: 'POR JORNADA', value: 'DAY' },
]

export default {
    name: 'MfBookingFormDialog',

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

        clients: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        equipments: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        operators: {
            require : true,
            type    : Array,
            default : () => ( [] ),
        },

        constructionManagers: {
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

            types: BookingTypesAndLabels,

            MachineryTypes: MachineryTypes.filter( (item) => item.value !== 'PICKUP'),

            workContidions: TruckWorkConditions,
        }

    },

    computed: {

        isInternal() {

            return this.formData.type === 'INTERNAL'

        },

        isExternal() {

            return this.formData.type === 'EXTERNAL'

        },

    },

    watch: {
        data(newValue) {

            this.formData = {
                machines  : [],
                receivers : [],
                ...JSON.parse(JSON.stringify(newValue) ),
            }

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
                mutation: gql`mutation ($form: BookingInput!) {
                    createBooking(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { createBooking } } ) => {

                    this.responseParser(createBooking.__typename)
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
                mutation: gql`mutation ($form: UpdateBookingInput!) {
                    updateBooking(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: this.formData,
                },
            } )
                .then( ( { data: { updateBooking } } ) => {

                    this.responseParser(updateBooking.__typename)
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

                case GraphqlTypename.BOOKING_NOT_FOUND:
                    this.$emit('save', Error.UNKNOWN_BOOKING)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },

        onAddReceiver() {

            this.formData.receivers.push( {
                editable : true,
                email    : '',
            } )

        },

        onAddMachinery() {

            this.formData.machines.push( {
                machineryType : null,
                equipment     : null,
                operator      : null,
                minHours      : 0,
                amountPerHour : 0,
                workCondition : null,
            } )

        },

        onDeleteReceiver(index) {

            this.formData.receivers.splice(index, 1)

        },

        onDeleteMachine(index) {

            this.formData.machines.splice(index, 1)

        },

        onChangeEquipment(id, index) {

            const equipment = this.equipments.find( (e) => e._id === id)
            this.$set(this.formData.machines, index, { ...this.formData.machines[index], equipment: id, machineryType: equipment.type } )

        },

        removeNonEditableReceivers() {

            this.formData.receivers = this.formData.receivers ? this.formData.receivers.filter( (receiver) => receiver.editable) : []

        },

        onTypeChange() {

            this.formData = {
                ...this.formData,
                constructionManager : null,
                machines            : [],
            }
            this.removeNonEditableReceivers()

        },
    },
}
</script>
