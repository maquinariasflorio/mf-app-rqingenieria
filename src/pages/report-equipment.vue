<template>
    <v-container class="mf-page mf-page-report-equipment">

        <v-data-table :headers="headers"
                      :loading="$apollo.queries.machineryJobRegistries.loading || downloading"
                      :search="search"
                      :items="machineryJobRegistries"
                      item-key="_id"
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>
                </v-toolbar>

                <v-toolbar flat>
                    <mf-date-picker v-model="formData.date"
                                    label="Fecha"
                                    :rules="[ v => !!v || 'La fecha es requerida' ]"
                                    @change="onSearch"
                    />
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

            <template #[`item.equipment`]="{ item }">
                {{ item.equipment.__typename === 'InternalEquipment' ? `${item.equipment.code} | ${item.equipment.name}` : item.equipment.name }}
            </template>

            <template #[`item.operator`]="{ item }">
                {{ item.executor.name }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onDownload(item)">
                    <v-icon>mdi-file-download-outline</v-icon>
                </v-btn>
            </template>

        </v-data-table>

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { GraphqlTypename } from './../static/errors/graphql_typename'
import { generateMachineryJobRegistryPdf } from './../static/utils/pdf'

export default {
    apollo: {
        machineryJobRegistries: {
            query: gql`query getAllMachineryJobRegistryByDate($date: String!) {
                getAllMachineryJobRegistryByDate(date: $date) {
                    results {
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
                }
            }`,

            update: (data) => data.getAllMachineryJobRegistryByDate.results,

            variables() {

                return {
                    date: this.date,
                }

            },

            fetchPolicy: 'network-only',
        },
    },

    data() {

        return {
            downloading : false,
            search      : '',

            formData: {
                date: moment().format('YYYY-MM-DD'),
            },

            date: moment().format('YYYY-MM-DD'),

            headers: [
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
                {
                    text       : 'Acciones',
                    value      : 'actions',
                    width      : '110px',
                    sortable   : false,
                    filterable : false,
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
        onSearch() {

            this.date = this.formData.date

        },

        onDownload(item) {

            generateMachineryJobRegistryPdf( {
                title : `reporte_equipo_folio_${item.folio}`,
                data  : item,
            } )

        },
    },
}
</script>
