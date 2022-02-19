<template>
    <v-container class="mf-page mf-page-pay-states-daily">

        <v-card :loading="loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
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

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { generateDailyPayStatePdf } from './../static/utils/pdf'

moment.locale('es')

export default {
    data() {

        return {
            loading  : false,
            formData : {
                date: moment().format('YYYY-MM-DD'),
            },
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
                    query: gql`query getDailyPayState($date: String!) {
                        getDailyPayState(date: $date) {
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
                                    amounType,
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
                                    amounType,
                                }
                            },
                        }
                    }`,

                    variables: {
                        ...this.formData,
                    },

                    fetchPolicy: 'network-only',
                } )
                    .then( ( { data: { getDailyPayState } } ) => {

                        const numeral = require('numeral')
                        require('numeral/locales/es')

                        numeral.locale('es')

                        let total = 0
                        let parsedeData = []

                        parsedeData = [ ...parsedeData, ...getDailyPayState.intern.OTHER.map( (item) => {

                            total += item.totalAmount

                            return {
                                client       : item.client.name,
                                building     : item.building,
                                operator     : item.operator.name,
                                equipment    : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                amountPerUse : numeral(item.amountPerUse).format('$0,0'),
                                amounType    : item.amounType,
                                hours        : item.hours,
                                minHours     : item.minHours,
                                toFacture    : item.toFacture,
                                totalAmount  : numeral(item.totalAmount).format('$0,0'),
                            }

                        } ) ]

                        parsedeData = [ ...parsedeData, ...getDailyPayState.intern.TRUCK.map( (item) => {

                            total += item.totalAmount

                            return {
                                client         : item.client.name,
                                building       : item.building,
                                operator       : item.operator.name,
                                equipment      : item.equipment.__typename === 'ExternalEquipment' ? item.equipment.name : item.equipment.code,
                                amountPerUse   : numeral(item.amountPerUse).format('$0,0'),
                                amounType      : item.amounType,
                                hours          : 0,
                                minHours       : 0,
                                toFacture      : numeral(item.totalAmount).format('$0,0'),
                                totalAmount    : numeral(item.totalAmount).format('$0,0'),
                                load           : item.load,
                                origin         : item.origin,
                                volume         : item.volume,
                                workingDayType : item.workingDayType,
                                workCondition  : item.workCondition,
                                totalTravels   : item.totalTravels,
                            }

                        } ) ]

                        generateDailyPayStatePdf( {
                            title : 'estado_pago_diario',
                            data  : parsedeData,
                            date  : moment(this.formData.date).format('dddd DD [de] MMMM [de] YYYY'),
                            total : numeral(total).format('$0,0'),
                        } )
                        this.loading = false

                    } )
                    .catch( (error) => {

                        console.warn(error)
                        this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                        this.loading = false

                    } )

            }

        },
    },
}
</script>
