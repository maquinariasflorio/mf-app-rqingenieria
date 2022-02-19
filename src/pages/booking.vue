<template>
    <v-container class="mf-page mf-page-booking">
        <v-data-table :headers="headers"
                      :loading="$apollo.queries.bookings.loading || deleteLoading || downloading"
                      :search="search"
                      :items="bookings"
                      item-key="_id"
                      show-expand
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>

                    <v-spacer />

                    <v-btn icon
                           dark
                           color="primary"
                           :disabled="$apollo.queries.bookings.loading || deleteLoading || downloading"
                           style="margin-right: 10px"
                           @click="downloadTable"
                    >
                        <v-icon>
                            mdi-file-download-outline
                        </v-icon>
                    </v-btn>

                    <v-btn :disabled="$apollo.queries.bookings.loading || deleteLoading || downloading" color="primary" @click.stop="onNew">
                        Nuevo
                    </v-btn>
                </v-toolbar>

                <v-toolbar flat>
                    <v-text-field v-model="search"
                                  append-icon="mdi-magnify"
                                  label="Buscar"
                                  single-line
                                  hide-details
                    />
                </v-toolbar>
            </template>

            <template #[`item.type`]="{ item }">
                {{ getTypeLabel(item.type) }}
            </template>

            <template #[`item.client`]="{ item }">
                {{ getLabelOfItemById(clients, item.client, 'name') }}
            </template>

            <template #[`item.startDate`]="{ item }">
                {{ getDateLabelFormat(item.startDate) }}
            </template>

            <template #[`item.endDate`]="{ item }">
                {{ getDateLabelFormat(item.endDate) }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

            <template #expanded-item="{ isMobile, item }">
                <td :colspan="headers.length"
                    :class="{
                        'mf-inner-table': true,
                        'v-data-table__mobile-row': isMobile,
                    }"
                >

                    <!-- INNER TABLE -->
                    <v-data-table :headers="headersMachines"
                                  :items="item.machines"
                                  dense
                                  hide-default-footer
                                  :items-per-page="-1"
                    >

                        <template #[`item.machineryType`]="{ item: innerItem }">
                            {{ getMachineryTypeLabel(innerItem.machineryType) }}
                        </template>

                        <template #[`item.equipment`]="{ item: innerItem }">
                            {{ getEquipmentLabel(innerItem.equipment) }}
                        </template>

                        <template #[`item.operator`]="{ item: innerItem }">
                            {{ getOperatorLabel(innerItem.operator) }}
                        </template>

                    </v-data-table>
                </td>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-booking-form-dialog v-model="showForm"
                                :is-new="isNew"
                                :data="formData"
                                :clients="clients"
                                :equipments="equipments"
                                :operators="operators"
                                :construction-managers="constructionManagers"
                                @save="onSave"
        />

        <mf-delete-dialog ref="deleteDialog" @confirm="onDeleteConfirm" />

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { GraphqlTypename } from './../static/errors/graphql_typename'
import { BookingTypes, BookingTypesAndLabels, TruckWorkConditionsTypes } from './../components/MfBookingFormDialog'
import { MachineryTypes } from './../components/MfEquipmentFormDialog'
import { newWorkbook, setExcelHeader, addExcelRow, saveExcelFile, autoWidth } from './../static/utils/excel'

export default {
    apollo: {
        bookings: {
            query: gql`query {
                getAllBookings {
                    _id,
                    type,
                    constructionManager,
                    client,
                    company,
                    building,
                    startDate,
                    endDate,
                    address,
                    machines {
                        machineryType,
                        equipment,
                        operator,
                        minHours,
                        amountPerHour,
                        workCondition,
                        volume,
                        amountPerTravel,
                        amountPerDay,
                        load,
                        origin,
                    },
                    receivers {
                        editable,
                        email,
                    },
                }
            }`,
            update: (data) => data.getAllBookings,
        },

        clients: {
            query: gql`query {
                getAllClients {
                    _id,
                    name,
                    billing {
                        rut
                    }
                }
            }`,
            update: (data) => data.getAllClients,
        },

        equipments: {
            query: gql`query {
                getAllEquipments {
                    _id,
                    type,
                    name,
                    code,
                    brand,
                    model,
                    patent,
                }
            }`,
            update: (data) => data.getAllEquipments,
        },

        operators: {
            query: gql`query {
                getAllUsersWithRoleName(role: "operator") {
                    _id,
                    rut,
                    name,
                    email,
                }
            }`,
            update: (data) => data.getAllUsersWithRoleName,
        },

        constructionManagers: {
            query: gql`query {
                getAllUsersWithRoleName(role: "construction_manager") {
                    _id,
                    rut,
                    name,
                    email,
                }
            }`,
            update: (data) => data.getAllUsersWithRoleName,
        },
    },

    data() {

        return {
            downloading : false,
            search      : '',
            showForm    : false,
            isNew       : true,

            deleteLoading: false,

            formData: {},

            headers: [
                {
                    text       : 'Tipo',
                    value      : 'type',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Cliente',
                    value      : 'client',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Compañia Externa',
                    value      : 'company',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Obra',
                    value      : 'building',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Inicio',
                    value      : 'startDate',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Término',
                    value      : 'endDate',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Acciones',
                    value      : 'actions',
                    width      : '110px',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                { text: '', value: 'data-table-expand' },
            ],

            headersMachines: [
                {
                    text       : 'Tipo de Maquinaria',
                    value      : 'machineryType',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Maquinaria',
                    value      : 'equipment',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Operador',
                    value      : 'operator',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
            ],
        }

    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),
    },

    methods: {
        onNew() {

            this.isNew = true
            this.formData = {
                type      : BookingTypes.INTERNAL,
                receivers : [
                    {
                        editable : true,
                        email    : process.env.NUXT_ENV_OFFICE_EMAIL,
                    },
                ],

                startDate : moment().format('YYYY-MM-DD'),
                endDate   : moment().format('YYYY-MM-DD'),
            }
            this.showForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = {
                ...JSON.parse(JSON.stringify(item) ),
                startDate : moment.utc(item.startDate).format('YYYY-MM-DD'),
                endDate   : moment.utc(item.endDate).format('YYYY-MM-DD'),
            }
            this.showForm = true

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: DeleteBookingInput!) {
                    deleteBooking(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteBooking } } ) => {

                    if (deleteBooking.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.BOOKING_DELETED)
                        this.$apollo.queries.bookings.refetch()

                    }

                    if (deleteBooking.__typename === GraphqlTypename.BOOKING_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_BOOKING, 'error')


                    this.deleteLoading = false

                } )
                .catch( () => {

                    this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                    this.deleteLoading = false

                } )

        },

        onSave(error) {

            if (error) {

                this.$alert(error, 'error')

            }
            else {

                if (this.isNew)
                    this.$alert(Message.BOOKING_CREATED)
                else
                    this.$alert(Message.BOOKING_UPDATED)

                this.$apollo.queries.bookings.refetch()

            }

        },

        getTypeLabel(value) {

            const type = BookingTypesAndLabels.find( (type) => type.value === value)

            return type ? type.label : ''

        },

        getMachineryTypeLabel(value) {

            const type = MachineryTypes.find( (type) => type.value === value)

            return type ? type.label : ''

        },

        getLabelOfItemById(list, id, prop) {

            const item = list ? list.find( (i) => i._id === id) : null

            return item ? item[prop] : ''

        },

        getDateLabelFormat(date) {

            return date ? moment.utc(date).format('DD/MM/YYYY') : ''

        },

        getEquipmentLabel(equipment) {

            const code = this.getLabelOfItemById(this.equipments, equipment, 'code')

            if (code)
                return code
            else
                return equipment

        },

        getOperatorLabel(operator) {

            const name = this.getLabelOfItemById(this.operators, operator, 'name')

            if (name)
                return name
            else
                return operator

        },

        downloadTable() {

            this.downloading = true

            const { workbook, worksheet } = newWorkbook( { name: 'Arriendos' } )

            let headers = [
                'Cliente',
                'Obra',
                'Fecha Inicio',
                'Fecha Término',
                'Ubicación',
                'Equipo',
                'Operador',
                'Hrs mínimas',
                'Carga',
                'Origen Carga',
                'Valor Hora',
                'Valor Viaje',
                'Valor Jornada',
            ]

            let maxReceiversCount = 0
            let source = this.bookings.reduce( (acc, item) => {

                const commonData = [
                    this.getLabelOfItemById(this.clients, item.client, 'name'),
                    item.building,
                    this.getDateLabelFormat(item.startDate),
                    this.getDateLabelFormat(item.endDate),
                    item.address ? item.address : '',
                ]

                for (const machine of item.machines) {

                    const equipment = [
                        this.getEquipmentLabel(machine.equipment),
                        this.getOperatorLabel(machine.operator),
                        machine.minHours ? machine.minHours : '',
                        machine.load ? machine.load : '',
                        machine.origin ? machine.origin : '',
                        machine.amountPerHour ? machine.amountPerHour : '',
                        machine.amountPerTravel && machine.workCondition === TruckWorkConditionsTypes.TRAVEL ? machine.amountPerTravel : '',
                        machine.amountPerDay && machine.workCondition === TruckWorkConditionsTypes.DAY ? machine.amountPerDay : '',
                    ]

                    acc.push( [
                        ...commonData,
                        ...equipment,
                        ...item.receivers.map( (receiver) => receiver.email),
                    ] )

                }

                maxReceiversCount = Math.max(maxReceiversCount, item.receivers.length)

                return acc

            }, [] )

            headers = [ ...headers, ...Array(maxReceiversCount).fill('Correo receptor') ]

            source = source.map( (item) => {

                if (item.length < headers.length)
                    item = [ ...item, ...Array(headers.length - item.length).fill('') ]

                return item

            } )

            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, headers, { isHeader: true } )
            source.forEach( (data) => {addExcelRow(workbook, worksheet, data)} )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'arriendos')

            this.downloading = false

        },
    },
}
</script>
