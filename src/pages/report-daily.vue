<template>
    <v-container fluid class="mf-page mf-page-report-daily">

        <v-card :loading="loading">
            <v-card-text>

                <v-form ref="form">

                    <v-row>
                        <v-col style="padding: 0 15px;">
                            <mf-date-picker v-model="formData.date"
                                            label="Fecha"
                                            :attrs="{
                                                max: now,
                                            }"
                                            :disabled="loading"
                                            :rules="[ v => !!v || 'La fecha es requerida' ]"
                            />
                        </v-col>

                        <v-col cols="auto" style="padding: 0 15px;">
                            <v-btn block
                                   small
                                   color="primary"
                                   :disabled="loading"
                                   @click="submit"
                            >
                                Descargar
                            </v-btn>
                        </v-col>
                    </v-row>

                </v-form>

            </v-card-text>
        </v-card>

        <v-row class="info-row">
            <v-col v-for="(equipment, index) of equipments"
                   :key="index"
                   cols="6"
                   class="info-card"
            >
                <v-card>
                    <v-card-text>
                        <v-row align="center">
                            <v-col style="padding: 0 10px;" cols="auto">
                                <div class="overline">
                                    {{ equipment.__typename === 'InternalMachine' ? equipment.code : equipment.externalEquipment }}
                                </div>
                            </v-col>

                            <v-col style="padding: 0 10px;">
                                <v-chip-group active-class="primary--text" column>
                                    <v-chip v-for="tag in tags(equipment)" :key="tag.text" small :color="tag.color">
                                        {{ tag.text }}
                                    </v-chip>
                                </v-chip-group>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { newEmptyWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, mainColor, autoWidth } from './../static/utils/excel'

moment.locale('es')

export default {
    apollo: {
        bookings: {
            query: gql`query getBookingsByDate($date: String!) {
                getBookingsByDate(date: $date) {
                    building,
                    machines {
                        __typename,
                        ...on InternalMachine {
                            machineryType,
                            equipment {
                                _id,
                                code,
                            },
                            operator {
                                _id,
                                name,
                            }
                        },
                        ...on ExternalMachine {
                            machineryType,
                            externalEquipment: equipment,
                            externalOperator:operator,
                        }
                    },
                }
            }`,
            update(data) {

                this.bookings = data.getBookingsByDate
                this.setEquipments()

                return data.getBookingsByDate

            },

            variables() {

                return {
                    date: moment().format('YYYY-MM-DD'),
                }

            },

            fetchPolicy: 'network-only',
        },

        allInternEquipments: {
            query: gql`query {
                getAllEquipments {
                    _id,
                    type,
                    name,
                    code,
                    brand,
                    model,
                    patent,
                    type,
                }
            }`,

            update(data) {

                this.allInternEquipments = data.getAllEquipments
                this.setEquipments()

                return data.getAllEquipments

            },

            fetchPolicy: 'network-only',
        },

        jobRegistries: {
            query: gql`query getAllMachineryJobRegistryByDate($date: String!) {
                getAllMachineryJobRegistryByDate(date: $date) {
                    _id,
                    machineryType,
                    workingDayType,
                    totalTravels,
                    load,
                    workCondition,
                    building,
                    endHourmeter,
                    equipment {
                        __typename,
                        ...on InternalEquipment {
                            _id,
                            code,
                        },
                        ...on ExternalEquipment {
                            name,
                        }
                    },
                }
            }`,
            update(data) {

                this.jobRegistries = data.getAllMachineryJobRegistryByDate
                this.setEquipments()

                return data.getAllMachineryJobRegistryByDate

            },

            variables() {

                return {
                    date: moment().format('YYYY-MM-DD'),
                }

            },

            fetchPolicy: 'network-only',

            subscribeToMore: [
                {
                    document: gql`subscription {
                        jobRegistryAdded {
                            _id,
                            machineryType,
                            workingDayType,
                            totalTravels,
                            load,
                            workCondition,
                            building,
                            endHourmeter,
                            equipment {
                                __typename,
                                ...on InternalEquipment {
                                    _id,
                                    code,
                                },
                                ...on ExternalEquipment {
                                    name,
                                }
                            },
                        }
                    }`,

                    updateQuery( { getAllMachineryJobRegistryByDate }, { subscriptionData: { data: { jobRegistryAdded } } } ) {

                        this.jobRegistries.push(jobRegistryAdded)

                        return { getAllMachineryJobRegistryByDate: this.jobRegistries }

                    },
                },

                {
                    document: gql`subscription {
                        jobRegistryDeleted
                    }`,

                    updateQuery( { getAllMachineryJobRegistryByDate }, { subscriptionData: { data: { jobRegistryDeleted } } } ) {

                        const registryIndex = this.jobRegistries.findIndex( (job) => job._id === jobRegistryDeleted)
                        this.jobRegistries.splice(registryIndex, 1)

                        return { getAllMachineryJobRegistryByDate: this.jobRegistries }

                    },
                },

                {
                    document: gql`subscription {
                        jobRegistryUpdated {
                            _id,
                            machineryType,
                            workingDayType,
                            totalTravels,
                            load,
                            workCondition,
                            building,
                            endHourmeter,
                            equipment {
                                __typename,
                                ...on InternalEquipment {
                                    _id,
                                    code,
                                },
                                ...on ExternalEquipment {
                                    name,
                                }
                            },
                        }
                    }`,

                    updateQuery( { getAllMachineryJobRegistryByDate }, { subscriptionData: { data: { jobRegistryUpdated } } } ) {

                        const registryIndex = this.jobRegistries.findIndex( (job) => job._id === jobRegistryUpdated._id)
                        this.jobRegistries.splice(registryIndex, 1, jobRegistryUpdated)

                        return { getAllMachineryJobRegistryByDate: this.jobRegistries }

                    },
                },
            ],
        },
    },

    data() {

        return {
            loading  : false,
            formData : {
                date: moment().format('YYYY-MM-DD'),
            },

            jobRegistries       : [],
            equipments          : [],
            bookings            : [],
            allInternEquipments : [],
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
                    query: gql`query getDailyResume($date: String!) {
                        getDailyResume(date: $date) {
                            intern {
                                machinery {
                                    equipment,
                                    building,
                                    operator,
                                    address,
                                    startHourmeter,
                                    endHourmeter,
                                    totalHours,
                                    observations,
                                },

                                trucks {
                                    equipment,
                                    operator,
                                    volume,
                                    building,
                                    address,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    observations,
                                },
                            },

                            extern {
                                machinery {
                                    equipment,
                                    building,
                                    operator,
                                    address,
                                    startHourmeter,
                                    endHourmeter,
                                    totalHours,
                                    observations,
                                },

                                trucks {
                                    equipment,
                                    operator,
                                    volume,
                                    building,
                                    address,
                                    load,
                                    totalTravels,
                                    workingDayType,
                                    observations,
                                },
                            }
                        }
                    }`,

                    variables: {
                        ...this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getDailyResume } } ) => {

                        this.generateExcelFile(getDailyResume)
                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        generateExcelFile(data) {

            const workbook = newEmptyWorkbook()
            const worksheet = addWorksheet(workbook, 'Reporte Diario')
            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, [ `Fecha: ${moment(this.formData.date).format('DD-MM-YYYY')}` ], { isHeader: true, bordered: false } )
            addExcelRow(workbook, worksheet, [ 'EQUIPOS INTERNOS' ], { isHeader: true, bordered: false } )


            const machineryHeaders = [ 'Equipo', 'Obra', 'Operador', 'Ubicación', '', 'Horómetro Inicial', 'Horómetro Final', 'Total Horas', 'Observaciones' ]
            let addedRow = addExcelRow(workbook, worksheet, machineryHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )
            worksheet.mergeCells(addedRow.lastRowNumber, 7, addedRow.lastRowNumber, 8)

            data.intern.machinery.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.building,
                    item.operator,
                    item.address,
                    '',
                    item.startHourmeter,
                    item.endHourmeter,
                    item.totalHours,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )
                worksheet.mergeCells(lastRowNumber, 7, lastRowNumber, 8)

            } )


            const truckHeaders = [ 'Camión', 'Operador', 'Volumen m3', 'Obra', 'Ubicación', 'Tipo de Carga', 'Nro. Viajes', 'Jornada', 'Observaciones' ]
            addedRow = addExcelRow(workbook, worksheet, truckHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )

            data.intern.trucks.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.operator,
                    item.volume,
                    item.building,
                    item.address,
                    item.load,
                    item.totalTravels,
                    item.workingDayType,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )


            addExcelRow(workbook, worksheet, [ 'EQUIPOS EXTERNOS' ], { isHeader: true, bordered: false } )


            addedRow = addExcelRow(workbook, worksheet, machineryHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )
            worksheet.mergeCells(addedRow.lastRowNumber, 7, addedRow.lastRowNumber, 8)

            data.extern.machinery.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.building,
                    item.operator,
                    item.address,
                    '',
                    item.startHourmeter,
                    item.endHourmeter,
                    item.totalHours,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )
                worksheet.mergeCells(lastRowNumber, 7, lastRowNumber, 8)

            } )


            addedRow = addExcelRow(workbook, worksheet, truckHeaders, { isHeader: true } )

            addedRow.row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )

            data.extern.trucks.forEach( (item) => {

                const { row, lastRowNumber } = addExcelRow(workbook, worksheet, [
                    item.equipment,
                    item.operator,
                    item.volume,
                    item.building,
                    item.address,
                    item.load,
                    item.totalTravels,
                    item.workingDayType,
                    item.observations,
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'reporte_diario')

        },

        setEquipments() {

            this.equipments = []

            const groupedMachines = this.bookings ? this.bookings.reduce( (acc, cur) => {

                const machines = cur.machines.map( (item) => {

                    return {
                        ...item,
                        building: cur.building,
                    }

                } )

                return acc.concat(machines)

            }, [] ) : []

            const externalMachines = groupedMachines.filter( (machine) => machine.__typename === 'ExternalMachine').map( (equipment) => {

                return {
                    booking: groupedMachines.find( (machine) => machine.__typename === 'ExternalMachine' && machine.externalEquipment === equipment.externalEquipment),
                    ...equipment,
                }

            } )
            const internalMachines = this.allInternEquipments ? this.allInternEquipments.filter( (e) => e.type !== 'PICKUP').map( (equipment) => ( {
                __typename : 'InternalMachine',
                booking    : groupedMachines.find( (machine) => machine.__typename === 'InternalMachine' && machine.equipment._id === equipment._id),
                ...equipment,
            } ) ) : []

            const machinesUnion = [
                ...internalMachines,
                ...externalMachines,
            ]

            this.equipments = machinesUnion.reduce( (acc, cur) => {

                const existCurInAcc = acc.find( (equipment) => {

                    return equipment.__typename === cur.__typename
                        && (equipment.__typename === 'InternalMachine' ? equipment.code === cur.code : equipment.externalEquipment === cur.externalEquipment)

                } )

                if (!existCurInAcc) {

                    return [
                        ...acc,
                        cur,
                    ]

                }

                return acc

            }, [] )

        },

        tags(equipment) {

            const whenHasBooking = equipment.booking ? [
                { text: equipment.__typename === 'InternalMachine' ? `Op.: ${equipment.booking.operator.name}` : `Op.: ${equipment.externalOperator}`, color: 'indigo lighten-4' },
                ...this.getMachineryDetails(equipment),
                ...this.getTruckDetails(equipment),
            ] : [
                { text: 'No posee obra asociada', color: 'warning' },
            ]

            return [
                { text: equipment.__typename === 'InternalMachine' ? 'Interno' : 'Externo', color: 'blue lighten-4' },
                ...whenHasBooking,
            ]

        },

        getMachineryDetails(equipment) {

            if (equipment.__typename === 'InternalMachine') {

                if (equipment.type !== 'OTHER')
                    return []

            }
            else if (equipment.machineryType !== 'OTHER') {

                return []

            }

            const jobs = this.jobRegistries.filter( (item) => {

                return equipment.__typename === 'InternalMachine' ? item.equipment._id === equipment._id : item.equipment.name === equipment.externalEquipment

            } )

            const maxHourmeter = jobs.reduce( (prev, curr) => {

                return Math.max(prev, curr.endHourmeter)

            }, 0)

            return jobs && jobs.length > 0 ? [
                { text: `Obra: ${equipment.booking.building || ''}`, color: 'indigo lighten-4' },
                { text: `Horómetro: ${maxHourmeter}`, color: 'teal lighten-3' },
                { text: 'Completado', color: 'success' },
            ] : [
                { text: `Obra: ${equipment.booking.building || ''}`, color: 'indigo lighten-4' },
                { text: 'Horómetro:', color: 'teal lighten-3' },
                { text: 'Incompleto', color: 'error' },
            ]

        },

        getTruckDetails(equipment) {

            if (equipment.__typename === 'InternalMachine') {

                if (equipment.type !== 'TRUCK')
                    return []

            }
            else if (equipment.machineryType !== 'TRUCK') {

                return []

            }

            const jobs = this.jobRegistries.filter( (item) => {

                return equipment.__typename === 'InternalMachine' ? item.equipment._id === equipment._id : item.equipment.name === equipment.externalEquipment

            } )

            const totalTravels = jobs.reduce( (prev, curr) => {

                return prev + curr.totalTravels

            }, 0)

            return jobs && jobs.length > 0 ? [
                { text: `Obra: ${equipment.booking.building || ''}`, color: 'indigo lighten-4' },
                { text: `Total Viajes: ${totalTravels}`, color: 'teal lighten-3' },
                { text: 'Completado', color: 'success' },
            ] : [
                { text: `Obra: ${equipment.booking.building || ''}`, color: 'indigo lighten-4' },
                { text: 'Total Viajes:', color: 'teal lighten-3' },
                { text: 'Incompleto', color: 'error' },
            ]

        },
    },
}
</script>
