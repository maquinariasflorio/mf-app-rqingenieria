<template>
    <v-container class="mf-page mf-page-machinery-equipment">
        <v-data-table :headers="headers"
                      :loading="$apollo.queries.equipments.loading || deleteLoading || downloading"
                      :search="search"
                      :items="equipments"
                      item-key="_id"
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>

                    <v-spacer />

                    <v-btn icon
                           dark
                           color="primary"
                           :disabled="$apollo.queries.equipments.loading || deleteLoading || downloading"
                           style="margin-right: 10px"
                           @click="downloadTable"
                    >
                        <v-icon>
                            mdi-file-download-outline
                        </v-icon>
                    </v-btn>

                    <v-btn :disabled="$apollo.queries.equipments.loading || deleteLoading || downloading" color="primary" @click.stop="onNew">
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
                {{ equipmentTypes[item.type] }}
            </template>

            <template #[`item.maintenanceClass`]="{ item }">
                {{ maintenanceClasses[item.maintenanceClass] }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-equipment-form-dialog v-model="showForm"
                                  :is-new="isNew"
                                  :data="formData"
                                  @save="onSave"
        />

        <mf-delete-dialog ref="deleteDialog" @confirm="onDeleteConfirm" />

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import { Error } from './../static/errors'
import { Message } from './../static/messages'
import { GraphqlTypename } from './../static/errors/graphql_typename'
import { MaintenanceClasses, MachineryTypes } from './../components/MfEquipmentFormDialog'
import { newWorkbook, setExcelHeader, addExcelRow, saveExcelFile, autoWidth } from './../static/utils/excel'

export default {
    apollo: {
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
                    year,
                    volume,
                    maintenanceClass,
                }
            }`,
            update: (data) => data.getAllEquipments,
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

            equipmentTypes: {
                TRUCK  : MachineryTypes[0].label,
                OTHER  : MachineryTypes[2].label,
                PICKUP : MachineryTypes[1].label,
            },

            maintenanceClasses: {
                CLASS_A : MaintenanceClasses[0].label,
                CLASS_B : MaintenanceClasses[1].label,
            },

            headers: [
                {
                    text       : 'Tipo',
                    value      : 'type',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Código',
                    value      : 'code',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Marca',
                    value      : 'brand',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Modelo',
                    value      : 'model',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Patente',
                    value      : 'patent',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Año',
                    value      : 'year',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Volumen m3',
                    value      : 'volume',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Clase de Mantenimiento',
                    value      : 'maintenanceClass',
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
        onNew() {

            this.isNew = true
            this.formData = {}
            this.showForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = JSON.parse(JSON.stringify(item) )
            this.showForm = true

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: DeleteEquipmentInput!) {
                    deleteEquipment(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteEquipment } } ) => {

                    if (deleteEquipment.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.EQUIPMENT_DELETED)
                        this.$apollo.queries.equipments.refetch()

                    }

                    if (deleteEquipment.__typename === GraphqlTypename.EQUIPMENT_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_EQUIPMENT, 'error')


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
                    this.$alert(Message.EQUIPMENT_CREATED)
                else
                    this.$alert(Message.EQUIPMENT_UPDATED)

                this.$apollo.queries.equipments.refetch()

            }

        },

        downloadTable() {

            this.downloading = true

            const { workbook, worksheet } = newWorkbook( { name: 'Equipos' } )

            const headers = this.headers.filter( (h) => h.exportable).map( (h) => h.text)
            const source = this.equipments.map( (item) => {

                return [
                    item.code,
                    item.name,
                    item.brand,
                    item.model,
                    item.patent,
                    item.year,
                    item.volume ? item.volume : '',
                ]

            } )

            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, headers, { isHeader: true } )
            source.forEach( (data) => {addExcelRow(workbook, worksheet, data)} )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'equipos')

            this.downloading = false

        },
    },
}
</script>
