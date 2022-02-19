<template>
    <v-container class="mf-page mf-page-report-fuel">

        <v-card :loading="loading">
            <v-card-title>Diario</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.startDate"
                                    label="Fecha Inicio"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <mf-date-picker v-model="formData.endDate"
                                    label="Fecha Término"
                                    :attrs="{
                                        max: now,
                                    }"
                                    :disabled="loading"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                    />

                    <v-btn block color="primary" :disabled="loading" @click="submit">
                        Descargar
                    </v-btn>

                </v-form>

            </v-card-text>
        </v-card>


        <v-card :loading="loading" style="margin-top: 20px;">
            <v-card-title>Mensual</v-card-title>

            <v-card-text>

                <v-form ref="formMonth">

                    <v-dialog ref="dialog"
                              v-model="showMonthDialog"
                              :return-value.sync="formDataMonth.date"
                              persistent
                              width="290px"
                    >
                        <template #activator="{ on, attrs }">
                            <v-text-field v-model="formDataMonth.date"
                                          label="Mes"
                                          readonly
                                          v-bind="attrs"
                                          v-on="on"
                            />
                        </template>
                        <v-date-picker v-model="formDataMonth.date"
                                       type="month"
                                       scrollable
                        >
                            <v-spacer />
                            <v-btn text
                                   color="primary"
                                   @click="showMonthDialog = false"
                            >
                                Cancelar
                            </v-btn>
                            <v-btn text
                                   color="primary"
                                   @click="$refs.dialog.save(formDataMonth.date)"
                            >
                                Confirmar
                            </v-btn>
                        </v-date-picker>
                    </v-dialog>

                    <v-btn block color="primary" :disabled="loading" @click="submitMonth">
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
import { newEmptyWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, mainColor, autoWidth } from './../static/utils/excel'
import { FuelTypes } from './machinery-fuel-registry.vue'

moment.locale('es')

export default {
    data() {

        return {
            loading  : false,
            formData : {
                startDate : moment().format('YYYY-MM-DD'),
                endDate   : moment().format('YYYY-MM-DD'),
            },

            formDataMonth: {
                date: moment().format('YYYY-MM'),
            },

            showMonthDialog: false,
        }

    },

    computed: {
        now() {

            return moment().toISOString()

        },
    },

    methods: {
        submit() {

            if (this.$refs.form.validate() ) {

                this.loading = true

                this.$apollo.query( {
                    query: gql`query getAllFuelRegistries($startDate: String!, $endDate: String!) {
                        getAllFuelRegistries(startDate: $startDate, endDate: $endDate) {
                            _id,
                            count,
                            hourmeter,
                            operator {
                                __typename,
                                ...on InternalOperator {
                                    _id,
                                    name,
                                    rut,
                                },
                                ...on ExternalOperator {
                                    name,
                                },
                            },
                            equipment {
                                __typename,
                                ...on InternalEquipment {
                                    _id,
                                    name,
                                    code,
                                    patent,
                                },
                                ...on ExternalEquipment {
                                    name,
                                },
                            },
                            type,
                            date,
                            guia,
                            previousRegistry,
                            time,
                        }
                    }`,

                    variables: {
                        ...this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getAllFuelRegistries } } ) => {

                        this.generateExcelFile(getAllFuelRegistries)
                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        async generateExcelFile(data) {

            if (data.length === 0) {

                this.$alert('No hay datos para generar el archivo', 'info')

                return

            }

            const workbook = newEmptyWorkbook()
            const worksheet = addWorksheet(workbook, 'Registro de Combustible')
            setExcelHeader(workbook, worksheet)

            const headers = [ 'Fecha', 'Operación', 'Equipo', 'Litros', 'Horómetro Anterior', 'Horómetro', 'Total', 'Consumo L/hr', 'Hora', 'Guía', 'Operador' ]
            const { row } = addExcelRow(workbook, worksheet, headers, { isHeader: true } )

            row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )


            const { data: { getAllPreviousFuelRegistries } } = await this.$apollo.query( {
                query: gql`query getAllPreviousFuelRegistries($equipments: [String!]!) {
                    getAllPreviousFuelRegistries(equipments: $equipments) {
                        _id,
                        count,
                        hourmeter,
                        operator {
                            __typename,
                            ...on InternalOperator {
                                _id,
                                name,
                                rut,
                            },
                            ...on ExternalOperator {
                                name,
                            },
                        },
                        equipment {
                            __typename,
                            ...on InternalEquipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                            ...on ExternalEquipment {
                                name,
                            },
                        },
                        type,
                        date,
                        guia,
                        previousRegistry,
                    }
                }`,

                variables: {
                    equipments: data.reduce( (acc, item) => {

                        if (item.equipment.__typename === 'InternalEquipment' && item.previousRegistry)
                            acc.push(item.previousRegistry)


                        return acc

                    }, [] ),

                    date: this.formData.startDate,
                },

                fetchPolicy: 'network-only',
            } )


            data.forEach( (item) => {

                const previous = item.previousRegistry ? getAllPreviousFuelRegistries.find( (previous) => previous._id === item.previousRegistry) : null
                const previousHourmeter = previous ? previous.hourmeter : 0
                const type = FuelTypes.find( (type) => type.value === item.type).text


                const newRow = [
                    moment.utc(item.date).format('DD-MM-YYYY'),
                    type,
                    item.equipment.__typename === 'InternalEquipment' ? item.equipment.code : item.equipment.name,
                    item.count,
                    previousHourmeter,
                    item.hourmeter,
                    item.hourmeter - previousHourmeter,
                    item.hourmeter ? (item.count / (item.hourmeter - previousHourmeter) ).toFixed(2) : '-',
                    item.time,
                    item.guia ? item.guia : '',
                    item.operator.name,
                ]

                const { row } = addExcelRow(workbook, worksheet, newRow)

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'combustible')

        },

        submitMonth() {

            if (this.$refs.formMonth.validate() ) {

                this.loading = true

                const data = {
                    startDate : moment(this.formDataMonth.date, 'YYYY-MM').startOf('month').format('YYYY-MM-DD'),
                    endDate   : moment(this.formDataMonth.date, 'YYYY-MM').endOf('month').format('YYYY-MM-DD'),
                }

                this.$apollo.query( {
                    query: gql`query getAllFuelRegistries($startDate: String!, $endDate: String!) {
                        getAllFuelRegistries(startDate: $startDate, endDate: $endDate) {
                            _id,
                            count,
                            hourmeter,
                            operator {
                                __typename,
                                ...on InternalOperator {
                                    _id,
                                    name,
                                    rut,
                                },
                                ...on ExternalOperator {
                                    name,
                                },
                            },
                            equipment {
                                __typename,
                                ...on InternalEquipment {
                                    _id,
                                    name,
                                    code,
                                    patent,
                                },
                                ...on ExternalEquipment {
                                    name,
                                },
                            },
                            type,
                            date,
                            guia,
                            previousRegistry,
                            time,
                        }
                    }`,

                    variables: {
                        ...data,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getAllFuelRegistries } } ) => {

                        const groupedFuelRegistries = getAllFuelRegistries.reduce( (acc, item) => {

                            const key = item.equipment.__typename === 'InternalEquipment' ? item.equipment._id : item.equipment.name

                            if (!acc[key] )
                                acc[key] = []

                            acc[key].push(item)

                            return acc

                        }, {} )

                        const groupData = Object.values(groupedFuelRegistries).map( (item) => {

                            const fuelConsumed = item.reduce( (acc, item) => {

                                acc += item.count

                                return acc

                            }, 0)

                            const type = FuelTypes.find( (type) => type.value === item[0].type).text

                            return [
                                `${moment(data.startDate).format('DD-MM-YYYY')} al ${moment(data.endDate).format('DD-MM-YYYY')}`,
                                type,
                                item[0].equipment.__typename === 'InternalEquipment' ? item[0].equipment.code : item[0].equipment.name,
                                item[0].operator.name,
                                item[0].hourmeter,
                                item[item.length - 1].hourmeter,
                                fuelConsumed,
                            ]

                        } )

                        this.generateMonthExcelFile(groupData)

                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },

        generateMonthExcelFile(data) {

            if (data.length === 0) {

                this.$alert('No hay datos para generar el archivo', 'info')

                return

            }

            const workbook = newEmptyWorkbook()
            const worksheet = addWorksheet(workbook, 'Registro de Combustible Mensual')
            setExcelHeader(workbook, worksheet)

            const headers = [ 'Fecha', 'Operación', 'Equipo', 'Operador', 'Horómetro Inicial', 'Horómetro Final', 'Consumo (L)' ]
            const { row } = addExcelRow(workbook, worksheet, headers, { isHeader: true } )

            row.eachCell( (cell, colNumber) => {

                cell.alignment = { horizontal: 'center' }

            } )

            data.forEach( (item) => {

                const { row } = addExcelRow(workbook, worksheet, item)

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'combustible_mensual')

        },
    },
}
</script>
