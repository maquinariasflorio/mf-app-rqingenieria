<template>
    <v-container class="mf-page mf-page-pay-states-client">

        <v-card :loading="loading || $apollo.queries.payStatesFilters.loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading || $apollo.queries.payStatesFilters.loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Fin"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading || $apollo.queries.payStatesFilters.loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-select v-model="formData.client"
                              :items="clients"
                              label="Cliente"
                              item-text="name"
                              item-value="_id"
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                              :rules="[ v => !!v || 'El cliente es requerido' ]"
                              @change="setBuildings"
                    >

                        <template #item="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.billing.rut }} | {{ item.name }}
                        </template>

                    </v-select>

                    <v-select v-model="formData.building"
                              :items="buildings"
                              label="Obra"
                              item-text="name"
                              item-value="name"
                              clearable
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                              @change="setEquipments"
                    />

                    <v-select v-model="formData.equipment"
                              :items="equipments"
                              label="Maquinaria"
                              item-value="_id"
                              clearable
                              :disabled="loading || $apollo.queries.payStatesFilters.loading"
                    >

                        <template #item="{ item }">
                            {{ item.__typename === 'PayStateFilterExternalMachine' ? item.name : `${item.code} | ${item.name}` }}
                        </template>

                        <template #selection="{ item }">
                            {{ item.__typename === 'PayStateFilterExternalMachine' ? item.name : `${item.code} | ${item.name}` }}
                        </template>

                    </v-select>

                    <v-btn block color="primary" :disabled="loading" @click="submit">
                        Descargar
                    </v-btn>

                </v-form>

            </v-card-text>
        </v-card>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { generateGeneralPayStatePdf } from './../static/utils/pdf'
import { newWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, autoWidth } from './../static/utils/excel'

moment.locale('es')

export default {
    apollo: {
        payStatesFilters: {
            query: gql`query getBookingsForPayStates($startDate: String!, $endDate: String!) {
                getBookingsForPayStates(startDate: $startDate, endDate: $endDate) {
                    clients {
                        _id,
                        name,
                        billing {
                            rut
                        }
                    },
                    buildings {
                        name,
                        clientId,
                    },
                    equipments {
                        __typename,
                        ...on PayStateFilterInternalMachine {
                            _id,
                            name,
                            code,
                            fromBuilding,
                            fromClient,
                        },
                        ...on PayStateFilterExternalMachine {
                            _id: name,
                            name,
                            fromBuilding,
                            fromClient,
                        },
                    },
                }
            }`,

            update( { getBookingsForPayStates } ) {

                this.formData.client = null
                this.formData.building = null
                this.formData.equipment = null
                this.clients = getBookingsForPayStates.clients

                return getBookingsForPayStates

            },

            variables() {

                return {
                    startDate : this.formData.startDate,
                    endDate   : this.formData.endDate,
                }

            },
        },
    },

    data() {

        return {
            loading  : false,
            formData : {
                startDate : moment().format('YYYY-MM-DD'),
                endDate   : moment().format('YYYY-MM-DD'),
            },

            clients    : [],
            buildings  : [],
            equipments : [],
        }

    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),

        now() {

            return moment().toISOString()

        },
    },

    methods: {
        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                this.$apollo.query( {
                    query: gql`query getEquipmentPayState($filters: PayStatesFilter!) {
                        getEquipmentPayState(filters: $filters) {
                            intern {
                                OTHER {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    amountPerUse,
                                    hours,
                                    minHours,
                                    toFacture,
                                    totalAmount,
                                    folio,
                                },

                                TRUCK {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    volume,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    totalAmount,
                                    amountPerUse,
                                    workCondition,
                                    folio,
                                    origin,
                                }
                            },
                            extern {
                                OTHER {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    amountPerUse,
                                    hours,
                                    minHours,
                                    toFacture,
                                    totalAmount,
                                    folio,
                                },

                                TRUCK {
                                    client {
                                        name,
                                    },
                                    date,
                                    building,
                                    operator {
                                        __typename,
                                        ...on ExternalOperator {
                                            name,
                                        },
                                        ...on InternalOperator {
                                            _id,
                                            rut,
                                            name,
                                        },
                                    },
                                    equipment {
                                        __typename,
                                        ...on InternalEquipment {
                                            code,
                                        },
                                        ...on ExternalEquipment {
                                            name,
                                        },
                                    },
                                    volume,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    totalAmount,
                                    amountPerUse,
                                    workCondition,
                                    folio,
                                    origin,
                                }
                            }
                        }
                    }`,

                    variables: {
                        filters: {
                            ...this.formData,
                        },
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getEquipmentPayState } } ) => {

                        const numeral = require('numeral')
                        require('numeral/locales/es')

                        numeral.locale('es')

                        const parsedeData = {
                            intern: {
                                OTHER                 : [],
                                TRUCK                 : [],
                                totalOther            : 0,
                                totalToFactureOther   : 0,
                                totalOtherIva         : 0,
                                totalIvaIncludedOther : 0,
                            },

                            extern: {
                                OTHER                 : [],
                                TRUCK                 : [],
                                totalOther            : 0,
                                totalToFactureOther   : 0,
                                totalOtherIva         : 0,
                                totalIvaIncludedOther : 0,
                            },
                        }

                        parsedeData.intern.OTHER = getEquipmentPayState.intern.OTHER.map( (item) => {

                            parsedeData.intern.totalOther += item.totalAmount
                            parsedeData.intern.totalToFactureOther += item.toFacture

                            return {
                                client       : item.client.name,
                                date         : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building     : item.building,
                                operator     : item.operator.name,
                                equipment    : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                hours        : item.hours,
                                minHours     : item.minHours,
                                toFacture    : item.toFacture,
                                folio        : item.folio,
                                amountPerUse : numeral(item.amountPerUse).format('$0,0'),
                                totalAmount  : numeral(item.totalAmount).format('$0,0'),
                            }

                        } )

                        parsedeData.extern.OTHER = getEquipmentPayState.extern.OTHER.map( (item) => {

                            parsedeData.extern.totalOther += item.totalAmount
                            parsedeData.extern.totalToFactureOther += item.toFacture

                            return {
                                client       : item.client.name,
                                date         : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building     : item.building,
                                operator     : item.operator.name,
                                equipment    : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                hours        : item.hours,
                                minHours     : item.minHours,
                                toFacture    : item.toFacture,
                                folio        : item.folio,
                                amountPerUse : numeral(item.amountPerUse).format('$0,0'),
                                totalAmount  : numeral(item.totalAmount).format('$0,0'),
                            }

                        } )

                        parsedeData.intern.totalIvaIncludedOther = numeral(parsedeData.intern.totalOther * 1.19).format('$0,0')
                        parsedeData.extern.totalIvaIncludedOther = numeral(parsedeData.extern.totalOther * 1.19).format('$0,0')

                        parsedeData.intern.totalOtherIva = numeral(parsedeData.intern.totalOther * 0.19).format('$0,0')
                        parsedeData.extern.totalOtherIva = numeral(parsedeData.extern.totalOther * 0.19).format('$0,0')

                        parsedeData.intern.totalOther = numeral(parsedeData.intern.totalOther).format('$0,0')
                        parsedeData.extern.totalOther = numeral(parsedeData.extern.totalOther).format('$0,0')

                        parsedeData.intern.TRUCK = getEquipmentPayState.intern.TRUCK.map( (item) => {

                            return {
                                client         : item.client.name,
                                date           : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building       : item.building,
                                operator       : item.operator.name,
                                equipment      : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                toFacture      : numeral(item.totalAmount).format('$0,0'),
                                folio          : item.folio,
                                amountPerUse   : numeral(item.amountPerUse).format('$0,0'),
                                totalTravels   : item.totalTravels,
                                workingDayType : item.workingDayType,
                                workCondition  : item.workCondition,
                                load           : item.load,
                                origin         : item.origin,
                                volume         : item.volume,
                                totalAmount    : item.totalAmount,
                            }

                        } )

                        parsedeData.extern.TRUCK = getEquipmentPayState.extern.TRUCK.map( (item) => {

                            return {
                                client         : item.client.name,
                                date           : moment.utc(item.date).format('dddd DD [de] MMMM [de] YYYY'),
                                building       : item.building,
                                operator       : item.operator.name,
                                equipment      : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                toFacture      : numeral(item.totalAmount).format('$0,0'),
                                folio          : item.folio,
                                amountPerUse   : numeral(item.amountPerUse).format('$0,0'),
                                totalTravels   : item.totalTravels,
                                workingDayType : item.workingDayType,
                                workCondition  : item.workCondition,
                                load           : item.load,
                                origin         : item.origin,
                                volume         : item.volume,
                                totalAmount    : item.totalAmount,
                            }

                        } )

                        if (parsedeData.intern.OTHER.length > 0 || parsedeData.intern.TRUCK.length > 0 || parsedeData.extern.OTHER.length > 0 || parsedeData.extern.TRUCK.length > 0) {

                            this.exportExcelFile( {
                                title  : 'estado_pago',
                                data   : parsedeData,
                                client : this.payStatesFilters.clients.find( (c) => c._id === this.formData.client).name || '',
                            } )

                            generateGeneralPayStatePdf( {
                                title  : 'estado_pago',
                                data   : parsedeData,
                                client : this.payStatesFilters.clients.find( (c) => c._id === this.formData.client).name || '',
                            } )

                        }
                        else {

                            this.$alert('No hay datos para generar el archivo', 'info')

                        }

                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        setBuildings(clientId) {

            this.buildings = this.payStatesFilters.buildings.filter( (building) => building.clientId === clientId)
            this.setEquipments()

        },

        setEquipments() {

            this.equipments = this.payStatesFilters.equipments.filter( (equipment) => {

                const isFilteredByBuilding = this.formData.building ? equipment.fromBuilding.some( (building) => building === this.formData.building) : true
                const isFilteredByClient = this.formData.client ? equipment.fromClient.some( (client) => client === this.formData.client) : true

                return isFilteredByBuilding && isFilteredByClient

            } )

        },

        exportExcelFile( { title, data, client } ) {

            const numeral = require('numeral')
            require('numeral/locales/es')

            numeral.locale('es')

            function setTotalStyles(row) {

                row.eachCell( (cell, colNumber) => {

                    if (colNumber === 13) {cell.alignment = { horizontal: 'center' }}
                    else {

                        cell.alignment = { horizontal: 'right' }
                        cell.font = {
                            bold: true,
                        }

                    }

                } )

            }

            function addSignature(workbook, worksheet, lastRow) {

                let privateLastRow = lastRow
                // worksheet.addImage(seoSign, `G${privateLastRow + 4}:H${privateLastRow + 8}`)

                privateLastRow += 7
                let record = addExcelRow(workbook, worksheet, [ process.env.NUXT_ENV_CEO_NAME ], {
                    isHeader        : true,
                    bordered        : false,
                    withPreviousRow : false,
                    lastRowAdded    : privateLastRow,
                    mergeCells      : false,
                } )
                privateLastRow = record.lastRowNumber
                worksheet.mergeCells(privateLastRow, 2, privateLastRow, headers.length + 3)
                record.row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

                record = addExcelRow(workbook, worksheet, [ process.env.NUXT_ENV_CEO_PROFESION ], {
                    isHeader        : true,
                    withPreviousRow : false,
                    bordered        : false,
                    mergeCells      : false,
                    lastRowAdded    : privateLastRow - 1,
                } )
                privateLastRow = record.lastRowNumber
                worksheet.mergeCells(privateLastRow, 2, privateLastRow, headers.length + 3)
                record.row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

                record = addExcelRow(workbook, worksheet, [ process.env.NUXT_ENV_RAZON_SOCIAL ], {
                    isHeader        : true,
                    withPreviousRow : false,
                    bordered        : false,
                    mergeCells      : false,
                    lastRowAdded    : privateLastRow - 1,
                } )
                privateLastRow = record.lastRowNumber
                worksheet.mergeCells(privateLastRow, 2, privateLastRow, headers.length + 3)
                record.row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            }

            const { workbook, worksheet: otherInternWorksheet } = newWorkbook( { name: 'Maquinaria Internos' } )
            setExcelHeader(workbook, otherInternWorksheet)

            // const seoSign = workbook.addImage( {
            //     base64    : process.env.NUXT_ENV_CEO_SIGNATURE,
            //     extension : 'png',
            // } )


            // INTERN OTHER

            addExcelRow(workbook, otherInternWorksheet, [ 'INTERNOS' ], { isHeader: true, bordered: false } )
            addExcelRow(workbook, otherInternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )

            let headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Horómetro', 'Mínimas', 'A Facturar', 'Tarifa (incluye petroleo)', 'Cobro' ]
            addExcelRow(workbook, otherInternWorksheet, headers, { isHeader: true } )

            let totalFacture = 0

            data.intern.OTHER.forEach( (item) => {

                totalFacture += item.toFacture

                const { row } = addExcelRow(workbook, otherInternWorksheet, [
                    item.date,
                    item.building,
                    item.folio,
                    item.equipment,
                    item.operator,
                    item.hours,
                    item.minHours,
                    item.toFacture,
                    item.amountPerUse,
                    item.totalAmount,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            const { row: totalFactureRow } = addExcelRow(workbook, otherInternWorksheet, [
                '', '', '', '', '', '', '', '', 'Total Horas', totalFacture,
            ] )
            setTotalStyles(totalFactureRow)

            const { row: netoRow } = addExcelRow(workbook, otherInternWorksheet, [
                '', '', '', '', '', '', '', '', 'Neto', data.intern.totalOther,
            ] )
            setTotalStyles(netoRow)

            const { row: ivaRow } = addExcelRow(workbook, otherInternWorksheet, [
                '', '', '', '', '', '', '', '', 'IVA', data.intern.totalOtherIva,
            ] )
            setTotalStyles(ivaRow)

            const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, otherInternWorksheet, [
                '', '', '', '', '', '', '', '', 'Total', data.intern.totalIvaIncludedOther,
            ] )
            setTotalStyles(totalRow)

            autoWidth(otherInternWorksheet)
            addSignature(workbook, otherInternWorksheet, totalLastRowNumber)


            // INTERN TRUCK - DAY

            if (data) {

                const truckInternWorksheet = addWorksheet(workbook, 'Camiones Internos por Jornada')
                setExcelHeader(workbook, truckInternWorksheet)

                addExcelRow(workbook, truckInternWorksheet, [ 'INTERNOS' ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckInternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckInternWorksheet, [ 'Camión por Jornada' ], { isHeader: true, bordered: false } )

                headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Tipo Jornada', 'Monto', 'Volumen', 'A Facturar' ]
                addExcelRow(workbook, truckInternWorksheet, headers, { isHeader: true } )

                let totalTruck = 0

                const parsedData = data.intern.TRUCK.filter( (item) => item.workCondition === 'DAY').map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        item.date,
                        item.building,
                        item.folio,
                        item.equipment,
                        item.operator,
                        item.workingDayType,
                        item.amountPerUse,
                        item.volume,
                        numeral(item.totalAmount).format('$0,0'),
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                parsedData.forEach( (item) => {

                    const { row } = addExcelRow(workbook, truckInternWorksheet, item)

                    row.eachCell( (cell, colNumber) => {

                        cell.alignment = { horizontal: 'center' }

                    } )

                } )

                const { row: netoRow } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', 'Neto', totalTruck,
                ] )
                setTotalStyles(netoRow)

                const { row: ivaRow } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', 'IVA', totalTruckIva,
                ] )
                setTotalStyles(ivaRow)

                const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', 'Total', totalIvaIncludedTruck,
                ] )
                setTotalStyles(totalRow)

                autoWidth(truckInternWorksheet)
                addSignature(workbook, truckInternWorksheet, totalLastRowNumber)

            }


            // INTERN TRUCK - TRAVEL

            if (data) {

                const truckInternWorksheet = addWorksheet(workbook, 'Camiones Internos por Viaje')
                setExcelHeader(workbook, truckInternWorksheet)

                addExcelRow(workbook, truckInternWorksheet, [ 'INTERNOS' ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckInternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckInternWorksheet, [ 'Camión por Viaje' ], { isHeader: true, bordered: false } )

                headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Nro. Viajes', 'Tipo Carga', 'Origen Carga', 'Monto', 'Volumen', 'A Facturar' ]
                addExcelRow(workbook, truckInternWorksheet, headers, { isHeader: true } )

                let totalTruck = 0

                const parsedData = data.intern.TRUCK.filter( (item) => item.workCondition === 'TRAVEL').map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        item.date,
                        item.building,
                        item.folio,
                        item.equipment,
                        item.operator,
                        item.totalTravels,
                        item.load,
                        item.origin || '',
                        item.amountPerUse,
                        item.volume,
                        numeral(item.totalAmount).format('$0,0'),
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                parsedData.forEach( (item) => {

                    const { row } = addExcelRow(workbook, truckInternWorksheet, item)

                    row.eachCell( (cell, colNumber) => {

                        cell.alignment = { horizontal: 'center' }

                    } )

                } )

                const { row: netoRow } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'Neto', totalTruck,
                ] )
                setTotalStyles(netoRow)

                const { row: ivaRow } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'IVA', totalTruckIva,
                ] )
                setTotalStyles(ivaRow)

                const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, truckInternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'Total', totalIvaIncludedTruck,
                ] )
                setTotalStyles(totalRow)

                autoWidth(truckInternWorksheet)
                addSignature(workbook, truckInternWorksheet, totalLastRowNumber)

            }


            // EXTERN OTHER
            if (data) {

                const otherExternWorksheet = addWorksheet(workbook, 'Maquinaria Externos')
                setExcelHeader(workbook, otherExternWorksheet)

                addExcelRow(workbook, otherExternWorksheet, [ 'EXTERNOS' ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, otherExternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )

                headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Horómetro', 'Mínimas', 'A Facturar', 'Tarifa (incluye petroleo)', 'Cobro' ]
                addExcelRow(workbook, otherExternWorksheet, headers, { isHeader: true } )

                let totalFacture = 0

                data.extern.OTHER.forEach( (item) => {

                    totalFacture += item.toFacture

                    const { row } = addExcelRow(workbook, otherExternWorksheet, [
                        item.date,
                        item.building,
                        item.folio,
                        item.equipment,
                        item.operator,
                        item.hours,
                        item.minHours,
                        item.toFacture,
                        item.amountPerUse,
                        item.totalAmount,
                    ] )

                    row.eachCell( (cell, colNumber) => {

                        cell.alignment = { horizontal: 'center' }

                    } )

                } )

                const { row: totalFactureRow } = addExcelRow(workbook, otherExternWorksheet, [
                    '', '', '', '', '', '', '', '', 'Total Horas', totalFacture,
                ] )
                setTotalStyles(totalFactureRow)

                const { row: netoRow } = addExcelRow(workbook, otherExternWorksheet, [
                    '', '', '', '', '', '', '', '', 'Neto', data.extern.totalOther,
                ] )
                setTotalStyles(netoRow)

                const { row: ivaRow } = addExcelRow(workbook, otherExternWorksheet, [
                    '', '', '', '', '', '', '', '', 'IVA', data.extern.totalOtherIva,
                ] )
                setTotalStyles(ivaRow)

                const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, otherExternWorksheet, [
                    '', '', '', '', '', '', '', '', 'Total', data.extern.totalIvaIncludedOther,
                ] )
                setTotalStyles(totalRow)

                autoWidth(otherExternWorksheet)
                addSignature(workbook, otherExternWorksheet, totalLastRowNumber)

            }

            // EXTERN TRUCK - DAY

            if (data) {

                const truckExternWorksheet = addWorksheet(workbook, 'Camiones Externos por Jornada')
                setExcelHeader(workbook, truckExternWorksheet)

                addExcelRow(workbook, truckExternWorksheet, [ 'EXTERNOS' ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckExternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckExternWorksheet, [ 'Camión por Jornada' ], { isHeader: true, bordered: false } )

                headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Tipo Jornada', 'Monto', 'Volumen', 'A Facturar' ]
                addExcelRow(workbook, truckExternWorksheet, headers, { isHeader: true } )

                let totalTruck = 0

                const parsedData = data.extern.TRUCK.filter( (item) => item.workCondition === 'DAY').map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        item.date,
                        item.building,
                        item.folio,
                        item.equipment,
                        item.operator,
                        item.workingDayType,
                        item.amountPerUse,
                        item.volume,
                        numeral(item.totalAmount).format('$0,0'),
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                parsedData.forEach( (item) => {

                    const { row } = addExcelRow(workbook, truckExternWorksheet, item)

                    row.eachCell( (cell, colNumber) => {

                        cell.alignment = { horizontal: 'center' }

                    } )

                } )

                const { row: netoRow } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', 'Neto', totalTruck,
                ] )
                setTotalStyles(netoRow)

                const { row: ivaRow } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', 'IVA', totalTruckIva,
                ] )
                setTotalStyles(ivaRow)

                const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', 'Total', totalIvaIncludedTruck,
                ] )
                setTotalStyles(totalRow)

                autoWidth(truckExternWorksheet)
                addSignature(workbook, truckExternWorksheet, totalLastRowNumber)

            }


            // EXTERN TRUCK - TRAVEL

            if (data) {

                const truckExternWorksheet = addWorksheet(workbook, 'Camiones Externos por Viaje')
                setExcelHeader(workbook, truckExternWorksheet)

                addExcelRow(workbook, truckExternWorksheet, [ 'EXTERNOS' ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckExternWorksheet, [ `Cliente: ${client}` ], { isHeader: true, bordered: false } )
                addExcelRow(workbook, truckExternWorksheet, [ 'Camión por Viaje' ], { isHeader: true, bordered: false } )

                headers = [ 'Fecha', 'Obra', 'Nro. Reporte', 'Equipo', 'Operador', 'Nro. Viajes', 'Tipo Carga', 'Origen Carga', 'Monto', 'Volumen', 'A Facturar' ]
                addExcelRow(workbook, truckExternWorksheet, headers, { isHeader: true } )

                let totalTruck = 0

                const parsedData = data.extern.TRUCK.filter( (item) => item.workCondition === 'TRAVEL').map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        item.date,
                        item.building,
                        item.folio,
                        item.equipment,
                        item.operator,
                        item.totalTravels,
                        item.load,
                        item.origin || '',
                        item.amountPerUse,
                        item.volume,
                        numeral(item.totalAmount).format('$0,0'),
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                parsedData.forEach( (item) => {

                    const { row } = addExcelRow(workbook, truckExternWorksheet, item)

                    row.eachCell( (cell, colNumber) => {

                        cell.alignment = { horizontal: 'center' }

                    } )

                } )

                const { row: netoRow } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'Neto', totalTruck,
                ] )
                setTotalStyles(netoRow)

                const { row: ivaRow } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'IVA', totalTruckIva,
                ] )
                setTotalStyles(ivaRow)

                const { row: totalRow, lastRowNumber: totalLastRowNumber } = addExcelRow(workbook, truckExternWorksheet, [
                    '', '', '', '', '', '', '', '', '', 'Total', totalIvaIncludedTruck,
                ] )
                setTotalStyles(totalRow)

                autoWidth(truckExternWorksheet)
                addSignature(workbook, truckExternWorksheet, totalLastRowNumber)

            }

            saveExcelFile(workbook, title)

            this.downloading = false

        },
    },
}
</script>
