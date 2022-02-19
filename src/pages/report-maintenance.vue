<template>
    <v-container class="mf-page mf-page-report-maintenance">

        <v-card :loading="$apollo.queries.initialMaintenances.loading || loading">
            <v-card-title>{{ title }}</v-card-title>

            <v-card-text>

                <v-form ref="form">

                    <v-btn block color="primary" :disabled="$apollo.queries.initialMaintenances.loading || loading" @click="submit">
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
import { newEmptyWorkbook, addWorksheet, setExcelHeader, addExcelRow, saveExcelFile, mainColor, autoWidth } from './../static/utils/excel'

export default {
    apollo: {
        initialMaintenances: {
            query: gql`
                    query getAllLastMaintenance {
                        getAllLastMaintenance {
                            _id,
                            uid,
                            step,
                            equipment {
                                _id,
                                name,
                                code,
                                patent,
                            },
                            status,
                            kmsOfMachinery,
                        }
                    }
                `,

            update( { getAllLastMaintenance } ) {

                this.maintenances = getAllLastMaintenance

                return getAllLastMaintenance

            },
        },
    },

    data() {

        return {
            loading: false,
        }

    },

    computed: {
        ...mapGetters( {
            title: 'navbar/getTitle',
        } ),
    },

    methods: {
        submit() {

            if (this.maintenances.length === 0) {

                this.$alert('No hay datos para generar el archivo', 'info')

                return

            }

            const workbook = newEmptyWorkbook()

            const worksheet = addWorksheet(workbook, 'Resumen')
            setExcelHeader(workbook, worksheet)

            const headers = [ 'Nombre', 'Código', 'Horómetro', 'Mantención', 'Estado' ]
            addExcelRow(workbook, worksheet, headers, { isHeader: true } )


            // 1: group data by equipment._id
            const grouped = this.maintenances.reduce( (acc, cur) => {

                const key = cur.equipment._id

                if (!acc[ key ] )
                    acc[ key ] = cur

                if (cur.equipment.uid > acc[ key ].equipment.uid)
                    acc[ key ] = cur

                return acc

            }, {} )

            if (Object.keys(grouped).length === 0) {

                this.$alert('No hay datos para generar el archivo', 'info')

                return

            }


            // 2: add data to excel
            Object.values(grouped).forEach( (data) => {

                const { row } = addExcelRow(workbook, worksheet, [
                    data.equipment.name,
                    data.equipment.code,
                    data.kmsOfMachinery,
                    data.step,
                    data.status === 'DONE' ? 'Completada' : 'Pendiente',
                ] )

                row.eachCell( (cell, colNumber) => {

                    cell.alignment = { horizontal: 'center' }

                } )

            } )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'reporte_mantenciones')

        },
    },
}
</script>
