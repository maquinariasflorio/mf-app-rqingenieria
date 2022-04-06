<template>
    <v-dialog :value="value"
              fullscreen
              hide-overlay
              scrollable
              transition="dialog-bottom-transition"
              class="mf-component mf-component-machinery-job-registry-dialog"
              @input="$emit('input', $event)"
    >

        <v-card class="mf-component-machinery-job-registry-dialog-card" :loading="loading">

            <!-- Header -->
            <v-card-title>

                <v-toolbar dark color="primary">

                    <v-btn icon dark :disabled="loading" @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>Editar Registro de Uso</v-toolbar-title>
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

                <v-form ref="form">

                    <v-text-field :value="formData.client.name"
                                  label="Cliente"
                                  :disabled="true"
                    />

                    <v-text-field :value="formData.building"
                                  label="Obra"
                                  :disabled="true"
                    />

                    <!-- MACHINERY -->

                    <v-text-field v-if="isMachinery && !isOperator"
                                  :value="formData.startHourmeter"
                                  label="Horómetro Inicial"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El horómetro inicial es requerido' ]"
                                  @input="formData.startHourmeter = parseFloat($event)"
                                  @change="calculateTotalHours"
                    />

                    <v-text-field v-if="isMachinery && !isOperator"
                                  :value="formData.endHourmeter"
                                  label="Horómetro Final"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[
                                      v => !!v || 'El horómetro final es requerido',
                                      v => v > formData.startHourmeter || 'El horómetro final debe ser mayor al horómetro inicial'
                                  ]"
                                  @input="formData.endHourmeter = parseFloat($event)"
                                  @change="calculateTotalHours"
                    />

                    <v-text-field v-if="isMachinery && !isOperator"
                                  :value="formData.totalHours"
                                  label="Total de Horas"
                                  type="number"
                                  :disabled="true"
                                  @input="formData.totalHours = parseFloat($event)"
                    />


                    <!--BOTH CASE-->
                    <v-select v-if="isTruck && isByBoth && !isOperator"
                              v-model="formData.workCondition"
                              :items="TruckWorkConditions"
                              label="Condición de Trabajo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La condición de trabajo es requerida' ]"
                    />


                    <!--BY TRAVEL-->

                    <v-select v-if="isTruck && isByTravel && !isOperator"
                              v-model="formData.load"
                              :items="formData.client.billing.loads"
                              label="Tipo de Carga"
                              item-text="type"
                              item-value="type"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de carga es requerido' ]"
                    />

                    <v-text-field v-if="isTruck && isByTravel && !isOperator"
                                  :value="formData.totalTravels"
                                  label="Total de Viajes"
                                  type="number"
                                  :disabled="loading"
                                  @input="formData.totalTravels = Math.ceil(parseFloat($event))"
                    />


                    <!--BY DAY-->
                    <v-select v-if="isTruck && isByDay && !isOperator"
                              v-model="formData.workingDayType"
                              :items="workingDayTypes"
                              label="Tipo de Jornada"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de jornada es requerido' ]"
                    />

                    <v-select v-if="isTruck && isByDay && !isOperator"
                              v-model="formData.load"
                              :items="formData.client.billing.loads"
                              label="Tipo de Carga"
                              item-text="type"
                              item-value="type"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de carga es requerido' ]"
                    />

                    <v-textarea v-model="formData.observations"
                                label="Observaciones"
                                outlined
                                :disabled="loading"
                    />

                    <v-switch v-model="switchSignature"
                              label="Desea firmar ahora?"
                    />

                    <mf-signature-pad ref="signaturePad"
                                      label="Firma Operador / Jefe de Obra"
                                      :image.sync="formData.signature"
                                      :disabled="!switchSignature"
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
import { TruckWorkConditions, TruckWorkConditionsTypes } from './MfBookingFormDialog'
import { WorkingDayTypes } from './../pages/machinery-job-registry'
import { getMachineryJobPdfInBase64 } from './../static/utils/pdf'

const defaultFormData = {
    machineryType  : null,
    date           : null,
    startHourmeter : 0,
    endHourmeter   : 0,
    totalHours     : 0,
    client         : {
        biling: {
            loads: [],
        },
    },

    building : null,
    load     : null,
}

export default {
    name: 'MfMachineryJobRegistryDialog',

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
    },

    data() {

        return {
            formData: {
                ...defaultFormData,
            },

            loading         : false,
            switchSignature : this.data.signature ? true : false,

            TruckWorkConditions : TruckWorkConditions.filter( (condition) => condition.value !== TruckWorkConditionsTypes.BOTH),
            workingDayTypes     : WorkingDayTypes,
        }

    },

    computed: {

        isOperator() {

            return this.$auth.user.role.name === 'operator' || this.$auth.user.role.name === 'construction_manager'

        },

        isTruck() {

            return this.formData.machineryType === 'TRUCK'

        },

        isMachinery() {

            return this.formData.machineryType === 'OTHER'

        },

        isByTravel() {

            if (!this.formData.bookingWorkCondition)
                return false

            if (this.formData.bookingWorkCondition === TruckWorkConditionsTypes.TRAVEL)
                return true
            else if (this.formData.bookingWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.TRAVEL)
                return true

            return false

        },

        isByBoth() {

            return this.formData.bookingWorkCondition && this.formData.bookingWorkCondition === TruckWorkConditionsTypes.BOTH

        },

        isByDay() {

            if (!this.formData.bookingWorkCondition)
                return false

            if (this.formData.bookingWorkCondition === TruckWorkConditionsTypes.DAY)
                return true
            else if (this.formData.bookingWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.DAY)
                return true

            return false

        },

    },

    watch: {
        data() {

            this.formData = {
                ...defaultFormData,
                ...this.data,
            }

        },
    },

    methods: {
        calculateTotalHours() {

            this.formData.totalHours = this.formData.endHourmeter - this.formData.startHourmeter

        },

        onSave() {

            if (this.$refs.form.validate() )
                this.update()


        },

        update() {

            this.loading = true

            this.$apollo.mutate( {
                mutation: gql`mutation updateMachineryJobRegistry($form: UpdateMachineryJobRegistryInput!) {
                    updateMachineryJobRegistry(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        ...this.formData,
                        client    : this.formData.client ? this.formData.client._id : null,
                        executor  : this.formData.executor ? this.formData.executor._id : null,
                        equipment : '',
                        signature : this.switchSignature ? this.$refs.signaturePad.getValue() : null,
                        operator  : '',
                    },
                },
            } )
                .then(async( { data: { updateMachineryJobRegistry } } ) => {

                    await this.responseParser(updateMachineryJobRegistry.__typename, this.formData._id)
                    this.loading = false

                } )
                .catch( () => {

                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)
                    this.loading = false

                } )

        },

        async responseParser(typename, id) {

            switch (typename) {

                case GraphqlTypename.OK: {

                    if (this.switchSignature) {

                        let { data } = await this.$apollo.query( {
                            query: gql`query ($id: String!) {
                            getJobRegistryById(id: $id) {
                                _id,
                                equipment {
                                    __typename,
                                    ...on InternalEquipment {
                                        _id,
                                        code,
                                        name,
                                        volume,
                                    },
                                    ...on ExternalEquipment {
                                        name,
                                        volume,
                                    }
                                },
                                date,
                                startHourmeter,
                                endHourmeter,
                                totalHours,
                                signature,
                                totalTravels,
                                machineryType,
                                workCondition,
                                load,
                                machineryType,
                                client {
                                    _id,
                                    name,
                                    billing {
                                        rut,
                                    }
                                },
                                executor {
                                    _id,
                                    rut,
                                    name,
                                    role,
                                    signature,
                                },
                                building,
                                bookingWorkCondition,
                                workingDayType,
                                observations,
                                folio,
                                operator {
                                    __typename,
                                    ...on InternalOperator {
                                        _id,
                                        rut,
                                        name,
                                    },
                                    ...on ExternalOperator {
                                        name,
                                    }
                                },
                                address,
                            }
                        }`,

                            variables: {
                                id,
                            },
                        } )

                        data = data && data.getJobRegistryById && data.getJobRegistryById.length > 0 ? data.getJobRegistryById[0] : {}

                        let currentBooking = await this.$apollo.query( {
                            query: gql`query getBookingByClientDateEquipmentBuilding($client: String!, $date: String!, $equipment: String!, $building: String!) {
                                getBookingByClientDateEquipmentBuilding(client: $client, date: $date, equipment: $equipment, building: $building) {
                                    _id,
                                    receivers {
                                        email
                                    },
                                }
                            }`,

                            variables: {
                                client    : this.formData.client._id,
                                date      : this.formData.date,
                                equipment : this.formData.equipment.__typename === 'InternalEquipment' ? this.formData.equipment._id : this.formData.equipment.name,
                                building  : this.formData.building,
                            },

                            fetchPolicy: 'network-only',
                        } )

                        currentBooking = currentBooking && currentBooking.data && currentBooking.data.getBookingByClientDateEquipmentBuilding && currentBooking.data.getBookingByClientDateEquipmentBuilding.length > 0 ? currentBooking.data.getBookingByClientDateEquipmentBuilding[0] : {}

                        const receivers = currentBooking.receivers.map( (r) => r.email)

                        const file = await getMachineryJobPdfInBase64( {
                            title    : `reporte_equipo_folio_${data.folio}`,
                            data,
                            download : false,
                            get64    : true,
                        } )

                        await this.$apollo.query( {
                            query: gql`query sendJobRegistryByEmail($file: String!, $folio: String!, $receivers: [String!]!) {
                            sendJobRegistryByEmail(file: $file, folio: $folio, receivers: $receivers) {
                                __typename,
                            }
                        }`,

                            variables: {
                                file,
                                receivers,
                                folio: data.folio.toString(),
                            },
                        } )

                    }

                    this.$emit('save')
                    this.$emit('input', false)

                    break

                }

                case GraphqlTypename.MACHINERY_JOB_REGISTRY_NOT_FOUND:
                    this.$emit('save', Error.UNKNOWN_MACHINERY_JOB_REGISTRY)

                    break

                default:
                    this.$emit('save', Error.DEFAULT_ERROR_MESSAGE)

                    break

            }

        },
    },
}
</script>
