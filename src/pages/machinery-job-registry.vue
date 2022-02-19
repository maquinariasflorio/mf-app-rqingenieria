<template>
    <v-container class="mf-page mf-page-machinery-job-registry">

        <v-form ref="form">

            <v-stepper v-model="step"
                       vertical
            >

                <!--STEP 1-->

                <v-stepper-step step="1">
                    Datos Generales
                </v-stepper-step>

                <v-stepper-content step="1">
                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-select v-if="$auth.user.role.name === 'operator'"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="onEquipmentChange"
                    >

                        <template #item="{ item }">
                            {{ item.code }} | {{ item.patent }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.code }} | {{ item.patent }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-if="$auth.user.role.name === 'construction_manager'"
                              v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              item-text="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La maquinaria es requerida' ]"
                              @change="onEquipmentChange"
                    />

                    <v-btn color="primary" @click="step++">
                        Continuar
                    </v-btn>

                </v-stepper-content>


                <!--STEP 2-->
                <v-stepper-step step="2">
                    Ingreso de Uso
                </v-stepper-step>

                <v-stepper-content step="2">
                    <!-- MACHINERY -->

                    <v-text-field v-if="isMachinery"
                                  :value="formData.startHourmeter"
                                  label="Horómetro Inicial"
                                  type="number"
                                  :disabled="loading"
                                  :loading="$apollo.queries.previousJobRegistry.loading"
                                  :rules="[ v => !!v || 'El horómetro inicial es requerido' ]"
                                  @input="formData.startHourmeter = parseFloat($event)"
                                  @change="calculateTotalHours"
                    />

                    <v-text-field v-if="isMachinery"
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

                    <v-text-field v-if="isMachinery"
                                  :value="formData.totalHours"
                                  label="Total de Horas"
                                  type="number"
                                  :disabled="true"
                                  @input="formData.totalHours = parseFloat($event)"
                    />


                    <!-- TRUCKS -->

                    <v-select v-if="isTruck"
                              v-model="formData.client"
                              :items="clients"
                              label="Cliente"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El cliente es requerido' ]"
                              @change="onClientChange"
                    >

                        <template #item="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-if="isTruck"
                              v-model="formData.building"
                              :items="buildings"
                              label="Obra"
                              item-text="building"
                              item-value="building"
                              :disabled="loading"
                              :loading="$apollo.queries.buildings.loading"
                              :rules="[ v => !!v || 'La obra es requerida' ]"
                              @change="onBuildingChange"
                    />


                    <!--BOTH CASE-->
                    <v-select v-if="isTruck && isByBoth"
                              v-model="formData.workCondition"
                              :items="TruckWorkConditions"
                              label="Condición de Trabajo"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'La condición de trabajo es requerida' ]"
                    />


                    <!--BY TRAVEL-->

                    <v-select v-if="isTruck && isByTravel"
                              v-model="formData.load"
                              :items="loads"
                              label="Tipo de Carga"
                              item-text="load"
                              item-value="load"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de carga es requerido' ]"
                    />

                    <v-text-field v-if="isTruck && isByTravel"
                                  :value="formData.totalTravels"
                                  label="Total de Viajes"
                                  type="number"
                                  :disabled="loading"
                                  :rules="[ v => !!v || 'El total de viajes es requerido' ]"
                                  @input="formData.totalTravels = Math.ceil(parseFloat($event))"
                    />


                    <!--BY DAY-->
                    <v-select v-if="isTruck && isByDay"
                              v-model="formData.workingDayType"
                              :items="workingDayTypes"
                              label="Tipo de Jornada"
                              item-text="label"
                              item-value="value"
                              :disabled="loading"
                              :rules="[ v => !!v || 'El tipo de jornada es requerido' ]"
                    />


                    <v-btn color="primary" @click="step++">
                        Continuar
                    </v-btn>

                    <v-btn text @click="step--">
                        Volver
                    </v-btn>

                </v-stepper-content>


                <!--STEP 3-->
                <v-stepper-step step="3">
                    Observaciones y Firma
                </v-stepper-step>

                <v-stepper-content step="3">

                    <v-textarea v-model="formData.observations"
                                label="Observaciones"
                                outlined
                                :disabled="loading"
                    />

                    <v-switch v-model="switchSignature"
                              label="Desea firmar ahora?"
                    />

                    <mf-signature-pad ref="signaturePad"
                                      :label="$auth.user.role.name === 'operator' ? 'Firma Jefe de Obra' : 'Firma Operador'"
                                      :image.sync="formData.signature"
                                      :disabled="!switchSignature"
                    />

                    <v-btn color="primary" @click="submit">
                        Registrar
                    </v-btn>

                    <v-btn text @click="step--">
                        Volver
                    </v-btn>

                </v-stepper-content>

            </v-stepper>

        </v-form>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { MachineryTypes } from './../components/MfEquipmentFormDialog'
import { TruckWorkConditions, TruckWorkConditionsTypes } from './../components/MfBookingFormDialog'
import { GraphqlTypename } from './../static/errors/graphql_typename'
import { getMachineryJobPdfInBase64 } from './../static/utils/pdf'

export const WorkingDayTypes = [
    { label: 'COMPLETA', value: 'FULL' },
    { label: 'MEDIA', value: 'HALF' },
]

const defaultFormData = {
    machineryType  : MachineryTypes[0].value,
    date           : moment().format('YYYY-MM-DD'),
    startHourmeter : 0,
    endHourmeter   : 0,
    totalHours     : 0,
    client         : null,
    building       : null,
    load           : null,
    equipment      : null,
}

export default {
    apollo: {
        allClients: {
            query: gql`query {
                getAllClients {
                    _id,
                    name,
                    billing {
                        rut,
                    }
                }
            }`,
            update: (data) => data.getAllClients,
        },

        buildings: {
            query: gql`query getBuildingsByClientAndDate($client: String!, $date: String!, $equipment: String!) {
                getBuildingsByClientAndDate(client: $client, date: $date, equipment: $equipment) {
                    building,
                }
            }`,
            update: (data) => data.getBuildingsByClientAndDate,
            variables() {

                return {
                    client    : this.formData.client,
                    date      : this.formData.date,
                    equipment : this.formData.equipment,
                }

            },

            fetchPolicy: 'network-only',
        },

        currentBooking: {
            query: gql`query getBookingByClientDateEquipmentBuilding($client: String!, $date: String!, $equipment: String!, $building: String!) {
                getBookingByClientDateEquipmentBuilding(client: $client, date: $date, equipment: $equipment, building: $building) {
                    _id,
                    receivers {
                        email
                    },
                }
            }`,
            update: (data) => data.getBookingByClientDateEquipmentBuilding,
            variables() {

                return {
                    client    : this.formData.client,
                    date      : this.formData.date,
                    equipment : this.formData.equipment,
                    building  : this.formData.building,
                }

            },

            fetchPolicy: 'network-only',
        },

        equipments: {
            query: gql`query getAllEquipmentsByBuilding($user: String!, $date: String!) {
                getAllEquipmentsByBuilding(user: $user, date: $date) {
                    __typename,
                    ...on EquipmentsByBooking {
                        equipments {
                            _id,
                            type,
                            name,
                            code,
                            patent,
                            workCondition,
                            client {
                                _id,
                                name,
                                billing {
                                    rut,
                                }
                            },
                            building,
                            operator {
                                _id,
                                rut,
                                name,
                            },
                            address,
                            load,
                            origin,
                        }
                    }
                    ...on ExternalEquipmentsByBooking {
                        externalEquipments: equipments {
                            _id,
                            type,
                            minHours,
                            workCondition,
                            client {
                                _id,
                                name,
                                billing {
                                    rut,
                                }
                            },
                            building,
                            operator,
                            address,
                            load,
                            origin,
                        }
                    }
                }
            }`,

            update( { getAllEquipmentsByBuilding } ) {

                const isOperator = getAllEquipmentsByBuilding.__typename === 'EquipmentsByBooking'
                const equipments = isOperator
                    ? getAllEquipmentsByBuilding.equipments
                    : getAllEquipmentsByBuilding.externalEquipments

                this.formData.equipment = equipments.length > 0
                    ? equipments[0]._id
                    : null

                this.formData.machineryType = equipments.length > 0 ? equipments[0].type : null
                this.currentWorkCondition = equipments.length > 0 ? equipments[0].workCondition : null
                this.formData.client = equipments.length > 0 ? equipments[0].client._id : null
                this.formData.building = equipments.length > 0 ? equipments[0].building : null
                this.formData.address = equipments.length > 0 ? equipments[0].address : null
                this.formData.operator = equipments.length > 0
                    ? (isOperator ? equipments[0].operator._id : equipments[0].operator)
                    : null

                const machineriesByEquipment = equipments.filter( (equipment) => equipment._id === this.formData.equipment)
                const equipmentsByTravel = machineriesByEquipment.filter( (equipment) => equipment.workCondition === TruckWorkConditionsTypes.TRAVEL)

                this.loads = equipments.length > 0
                    ? equipmentsByTravel.map( (machine) => ( {
                        load   : machine.load,
                        origin : machine.origin,
                    } ) )
                    : []

                const allClientsWhereEquipmentExists = Array.from(new Set(
                    equipments.filter( (equipment) => equipment._id === this.formData.equipment)
                        .map( (equipment) => equipment.client._id),
                ) )

                this.clients = this.allClients.filter( (client) => allClientsWhereEquipmentExists.includes(client._id) )

                this.equipments = equipments
                this.onJobConditionsChange()

                return equipments

            },

            variables() {

                return {
                    user : this.$auth.user._id,
                    date : this.formData.date,
                }

            },

            fetchPolicy: 'network-only',
        },

        previousJobRegistry: {
            query: gql`query getPreviousMachineryJobRegistry($user: String!, $date: String!, $equipment: String!) {
                getPreviousMachineryJobRegistry(user: $user, date: $date, equipment: $equipment) {
                    endHourmeter,
                }
            }`,

            update( { getPreviousMachineryJobRegistry } ) {

                if (getPreviousMachineryJobRegistry.length > 0)
                    this.formData.startHourmeter = getPreviousMachineryJobRegistry[0].endHourmeter
                else
                    this.formData.startHourmeter = 0

            },

            variables() {

                return {
                    user      : this.$auth.user._id,
                    date      : this.formData.date,
                    equipment : this.formData.equipment,
                }

            },

            fetchPolicy: 'network-only',
        },

    },

    data() {

        return {
            loading         : false,
            step            : 1,
            switchSignature : false,
            formData        : {
                ...defaultFormData,
            },

            clients    : [],
            loads      : [],
            allClients : [],
            buildings  : [],
            equipments : [],

            MachineryTypes       : MachineryTypes.filter( (type) => type.value !== 'PICKUP'),
            TruckWorkConditions,
            workingDayTypes      : WorkingDayTypes,
            currentWorkCondition : null,
        }

    },

    computed: {

        now() {

            return moment().toISOString()

        },

        isTruck() {

            return this.formData.machineryType === 'TRUCK'

        },

        isMachinery() {

            return this.formData.machineryType === 'OTHER'

        },

        isByTravel() {

            if (!this.currentWorkCondition)
                return false

            if (this.currentWorkCondition === TruckWorkConditionsTypes.TRAVEL)
                return true
            else if (this.currentWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.TRAVEL)
                return true

            return false

        },

        isByBoth() {

            return this.currentWorkCondition && this.currentWorkCondition === TruckWorkConditionsTypes.BOTH

        },

        isByDay() {

            if (!this.currentWorkCondition)
                return false

            if (this.currentWorkCondition === TruckWorkConditionsTypes.DAY)
                return true
            else if (this.currentWorkCondition === TruckWorkConditionsTypes.BOTH && this.formData.workCondition === TruckWorkConditionsTypes.DAY)
                return true

            return false

        },

    },

    methods: {

        calculateTotalHours() {

            this.formData.totalHours = this.formData.endHourmeter - this.formData.startHourmeter

        },

        onClientChange(clientId) {

            const equipmentFilter = this.equipments.filter( (equipment) => equipment._id === this.formData.equipment && equipment.client._id === clientId)
            this.formData.building = equipmentFilter.length > 0 ? equipmentFilter[0].building : null
            this.onJobConditionsChange()

        },

        onBuildingChange(building) {

            this.onJobConditionsChange()

        },

        onEquipmentChange(equipmentId) {

            const equipmentFilter = this.equipments.filter( (equipment) => equipment._id === equipmentId)

            this.formData.client = equipmentFilter[0].client._id
            this.formData.building = equipmentFilter[0].building
            this.formData.address = equipmentFilter[0].address
            this.formData.operator = typeof equipmentFilter[0].operator === 'string' ? equipmentFilter[0].operator : equipmentFilter[0].operator._id

            this.onJobConditionsChange()

            const allClientsWhereEquipmentExists = Array.from(new Set(
                this.equipments.filter( (equipment) => equipment._id === equipmentId)
                    .map( (equipment) => equipment.client._id),
            ) )

            this.clients = this.allClients.filter( (client) => allClientsWhereEquipmentExists.includes(client._id) )

            this.$apollo.queries.buildings.refetch()

        },

        onJobConditionsChange() {

            const equipmentId = this.formData.equipment
            const clientId = this.formData.client
            const buildingId = this.formData.building

            const equipmentFilter = this.equipments.filter( (equipment) => equipment._id === equipmentId && equipment.client._id === clientId && equipment.building === buildingId)
            const hasByTravel = equipmentFilter.some( (equipment) => equipment.workCondition === TruckWorkConditionsTypes.TRAVEL)
            const hasByDay = equipmentFilter.some( (equipment) => equipment.workCondition === TruckWorkConditionsTypes.DAY)
            const hasBoth = hasByTravel && hasByDay

            this.currentWorkCondition = hasBoth ? TruckWorkConditionsTypes.BOTH : equipmentFilter.length > 0 ? equipmentFilter[0].workCondition : null

            const equipmentsByTravel = equipmentFilter.filter( (equipment) => equipment.workCondition === TruckWorkConditionsTypes.TRAVEL)

            this.loads = equipmentFilter.length > 0
                ? equipmentsByTravel.map( (machine) => ( {
                    load   : machine.load,
                    origin : machine.origin,
                } ) )
                : []

            this.formData.address = equipmentFilter.length > 0 ? equipmentFilter[0].address : ''
            this.formData.machineryType = equipmentFilter.length > 0 ? equipmentFilter[0].type : ''

        },

        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                const load = this.loads.find( (load) => load.load === this.formData.load)

                this.$apollo.mutate( {
                    mutation: gql`mutation ($form: MachineryJobRegistryInput!) {
                        createMachineryJobRegistry(form: $form) {
                            __typename
                            ...on Ok {
                                message
                            }
                        }
                    }`,

                    variables: {
                        form: {
                            ...this.formData,
                            signature            : this.switchSignature ? this.$refs.signaturePad.getValue() : null,
                            bookingWorkCondition : this.currentWorkCondition,
                            origin               : load ? load.origin : null,
                        },
                    },
                } )
                    .then( ( { data: { createMachineryJobRegistry } } ) => {

                        this.responseParser(createMachineryJobRegistry.__typename, createMachineryJobRegistry.message)

                        this.formData = {
                            ...defaultFormData,
                        }
                        this.currentWorkCondition = null
                        this.$refs.signaturePad.reset()
                        this.switchSignature = false
                        this.step = 1

                        this.loading = false

                    } )
                    .catch( () => {

                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }
            else {

                this.$alert(Error.COMPLETE_FIELDS, 'error')

            }

        },

        async responseParser(typename, id) {

            switch (typename) {

                case GraphqlTypename.OK: {

                    this.$alert(Message.MACHINERY_JOB_REGISTRY_CREATED)

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

                        const receivers = this.currentBooking && this.currentBooking.length > 0 ? this.currentBooking[0].receivers.map( (r) => r.email) : null

                        const file = await getMachineryJobPdfInBase64( {
                            title    : `reporte_equipo_folio_${data.folio}`,
                            data,
                            download : false,
                            get64    : true,
                        } )

                        this.$apollo.query( {
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

                    break

                }

                default:
                    this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')

                    break

            }

        },
    },
}
</script>
