<template>
    <v-container class="mf-page mf-page-machinery-fuel-registry">
        <v-card :loading="$apollo.queries.bookings.loading || loading">
            <v-card-text>

                <v-form ref="form">

                    <v-select v-model="formData.type"
                              :items="FuelTypes"
                              label="Tipo de Operación"
                              item-value="value"
                              item-text="text"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de operación es requerido' ]"
                              @change="formData.equipment = null"
                    />

                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                                    @change="onChangeDate"
                    />

                    <mf-time-picker v-model="formData.time"
                                    label="Hora"
                                    :attrs="{
                                        max: nowTime,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La hora es requerida' ]"
                    />


                    <!--RECHARGE-->
                    <v-text-field v-if="formData.type === 'RECHARGE_OTHERS'"
                                  :value="formData.equipment"
                                  label="Equipo"
                                  :disabled="loading"
                                  class="mf-to-uppercase"
                                  :rules="[ v => !!v || 'El equipo es requerido' ]"
                                  @input="formData.equipment = $event.toUpperCase()"
                    />

                    <v-text-field v-if="formData.type === 'RECHARGE_OTHERS'"
                                  :value="formData.operator"
                                  label="Operador"
                                  :disabled="loading"
                                  class="mf-to-uppercase"
                                  @input="formData.operator = $event.toUpperCase()"
                    />

                    <v-text-field v-if="formData.type === 'RECHARGE_OTHERS'"
                                  :value="formData.hourmeter"
                                  label="Horómetro / Odómetro"
                                  type="number"
                                  :disabled="loading"
                                  @input="formData.hourmeter = parseFloat($event)"
                    />

                    <v-select v-if="formData.type === 'RECHARGE'"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="onEquipmentChange"
                    >

                        <template #item="{ item }">
                            {{ item.isInternal ? `${item.code} | ${item.patent} | ${item.name}` : item._id }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.isInternal ? `${item.code} | ${item.patent} | ${item.name}` : item._id }}
                        </template>

                    </v-select>

                    <v-select v-if="formData.type === 'RECHARGE'"
                              v-model="formData.operator"
                              :items="operators"
                              label="Operador"
                              item-value="_id"
                              :disabled="true"
                    >

                        <template #item="{ item }">
                            {{ item.isInternal ? `${item.rut} | ${item.name}` : item._id }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.isInternal ? `${item.rut} | ${item.name}` : item._id }}
                        </template>

                    </v-select>

                    <v-text-field v-if="formData.type === 'RECHARGE'"
                                  :value="formData.hourmeter"
                                  label="Horómetro / Odómetro"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El horómetro / odómetro es requerido' ]"
                                  @input="formData.hourmeter = parseFloat($event)"
                    />

                    <!--BUY-->

                    <v-text-field :value="formData.count"
                                  label="Litros"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'Los litros son requeridos' ]"
                                  @input="formData.count = parseFloat($event)"
                    />

                    <v-text-field v-if="formData.type === 'BUY'"
                                  :value="formData.guia"
                                  label="Nro Guía"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El número de guía es requerido' ]"
                                  @input="formData.guia = parseFloat($event)"
                    />

                    <v-btn block color="primary" @click="submit">
                        Registrar
                    </v-btn>

                </v-form>

            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { GraphqlTypename } from './../static/errors/graphql_typename'

export const FuelTypes = [
    {
        value : 'RECHARGE',
        text  : 'RECARGA',
    },
    {
        value : 'BUY',
        text  : 'COMPRA',
    },
    {
        value : 'RECHARGE_OTHERS',
        text  : 'RECARGA (OTROS)',
    },
]

const defaultFormData = {
    date      : moment().format('YYYY-MM-DD'),
    time      : moment().format('HH:mm'),
    type      : FuelTypes[0].value,
    count     : 0,
    hourmeter : 0,
    operator  : null,
}

export default {
    apollo: {
        equipments: {
            query: gql`query {
                getAllEquipments{
                    _id,
                    code,
                    patent,
                    name,
                }
            }`,

            update( { getAllEquipments } ) {

                this.internalEquipments = getAllEquipments.map( (e) => {

                    return {
                        ...e,
                        isInternal: true,
                    }

                } )

            },
        },

        bookings: {
            query: gql`query getBookingsByDate($date: String!) {
                getBookingsByDate (date: $date) {
                    __typename,
                    machines {
                        __typename,
                        ...on InternalMachine {
                            equipment {
                                _id,
                                code,
                                patent,
                                name,
                            },

                            operator {
                                _id,
                                rut,
                                name,
                            },
                        }
                        ...on ExternalMachine {
                            externalEquipment: equipment,
                            externalOperator:operator,
                        }
                    }
                }
            }`,
            update( { getBookingsByDate } ) {

                const equipments = []
                const operators = []

                getBookingsByDate.forEach( (booking) => {

                    booking.machines.forEach( (machine) => {

                        if (machine.__typename === 'InternalMachine') {

                            operators.push( {
                                ...machine.operator,
                                isInternal  : true,
                                equipmentId : machine.equipment._id,
                            } )

                        }
                        else if (machine.__typename === 'ExternalMachine') {

                            equipments.push( {
                                _id        : machine.externalEquipment,
                                isInternal : false,
                            } )
                            operators.push( {
                                _id         : machine.externalOperator,
                                isInternal  : false,
                                equipmentId : machine.externalEquipment,
                            } )

                        }

                    } )

                } )

                this.externalEquipments = equipments
                this.operators = operators

            },

            variables() {

                return {
                    equipments : [],
                    operators  : [],
                    date       : this.formData.date,
                }

            },
        },
    },

    data() {

        return {
            loading : false,
            now     : moment().toISOString(),
            nowTime : moment().format('HH:mm'),

            formData: {
                ...defaultFormData,
            },

            FuelTypes,

            internalEquipments : [],
            externalEquipments : [],
            operators          : [],
        }

    },

    computed: {
        equipments() {

            return this.internalEquipments.concat(this.externalEquipments)

        },
    },

    methods: {
        onEquipmentChange(id) {

            const operator = this.operators.find( (operator) => operator.equipmentId === id)

            this.formData.operator = operator ? operator._id : null

        },

        onChangeDate(date) {

            this.nowTime = moment(date).isSame(new Date(), 'day') ? moment().format('HH:mm') : null
            this.formData.time = moment(date).isSame(new Date(), 'day') ? moment().format('HH:mm') : null

        },

        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                const form = {
                    ...this.formData,
                }

                this.$apollo.mutate( {
                    mutation: gql`mutation ($form: MachineryFuelRegistryInput!) {
                    createMachineryFuelRegistry(form: $form) {
                        __typename
                    }
                }`,

                    variables: {
                        form,
                    },
                } )
                    .then( ( { data: { createMachineryFuelRegistry } } ) => {

                        this.responseParser(createMachineryFuelRegistry.__typename)

                        this.now = moment().toISOString(),
                        this.nowTime = moment().format('HH:mm'),
                        this.formData = {
                            ...defaultFormData,
                        }

                        this.loading = false

                    } )
                    .catch( () => {

                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        responseParser(typename) {

            switch (typename) {

                case GraphqlTypename.OK:
                    this.$alert(Message.MACHINERY_FUEL_REGISTRY_CREATED)

                    break

                default:
                    this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')

                    break

            }

        },
    },
}
</script>
