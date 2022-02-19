<template>
    <v-container class="mf-page mf-page-clients">
        <v-data-table :headers="clientHeaders"
                      :loading="$apollo.queries.clients.loading || deleteLoading || downloading"
                      :search="search"
                      :items="clients"
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
                           :disabled="$apollo.queries.clients.loading || deleteLoading || downloading"
                           style="margin-right: 10px"
                           @click="downloadTable"
                    >
                        <v-icon>
                            mdi-file-download-outline
                        </v-icon>
                    </v-btn>

                    <v-btn :disabled="$apollo.queries.clients.loading || deleteLoading || downloading" color="primary" @click.stop="onNew">
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

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

            <template #expanded-item="{ isMobile, item }">
                <td :colspan="clientHeaders.length"
                    :class="{
                        'mf-inner-table': true,
                        'v-data-table__mobile-row': isMobile,
                    }"
                >

                    <!-- INNER TABLE -->
                    <v-data-table :headers="clientBillingHeaders"
                                  :items="[item.billing]"
                                  dense
                                  hide-default-footer
                                  :items-per-page="-1"
                    />
                </td>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-client-form-dialog v-model="showClientForm"
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
import { newWorkbook, setExcelHeader, addExcelRow, saveExcelFile, autoWidth } from './../static/utils/excel'

export default {
    apollo: {
        clients: {
            query: gql`query {
                getAllClients {
                    _id,
                    name,
                    paymentCondition,
                    receivers,
                    billing {
                        name,
                        rut,
                        category,
                        address,
                        phone,
                    },
                }
            }`,
            update: (data) => data.getAllClients,
        },
    },

    data() {

        return {
            downloading    : false,
            search         : '',
            showClientForm : false,
            isNew          : true,

            deleteLoading: false,

            formData: {
                billing: {

                },
            },

            clientHeaders: [
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Condición de pago',
                    value      : 'paymentCondition',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
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

            clientBillingHeaders: [
                {
                    text       : 'RUT',
                    value      : 'rut',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Nombre',
                    value      : 'name',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
                {
                    text       : 'Giro',
                    value      : 'category',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Dirección',
                    value      : 'address',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Teléfono',
                    value      : 'phone',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                    exportable : true,
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
                receivers : [],
                billing   : {
                },
            }
            this.showClientForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = JSON.parse(JSON.stringify(item) )
            this.showClientForm = true

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: DeleteClientInput!) {
                    deleteClient(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteClient } } ) => {

                    if (deleteClient.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.CLIENT_DELETED)
                        this.$apollo.queries.clients.refetch()

                    }

                    if (deleteClient.__typename === GraphqlTypename.CLIENT_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_CLIENT, 'error')


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
                    this.$alert(Message.CLIENT_CREATED)
                else
                    this.$alert(Message.CLIENT_UPDATED)

                this.$apollo.queries.clients.refetch()

            }

        },

        downloadTable() {

            this.downloading = true

            const { workbook, worksheet } = newWorkbook( { name: 'Clientes' } )

            // Mapping data

            let headers = this.clientHeaders.filter( (h) => h.exportable).map( (h) => h.text)
            headers = [ ...headers, ...this.clientBillingHeaders.filter( (h) => h.exportable).map( (h) => h.text) ]

            let maxReceivers = 0
            let source = this.clients.map( (item) => {

                maxReceivers = Math.max(maxReceivers, item.receivers.length)

                return [
                    item.name,
                    item.paymentCondition,
                    item.billing.rut,
                    item.billing.category,
                    item.billing.address,
                    item.billing.phone,
                    ...item.receivers,
                ]

            } )

            headers = [ ...headers, ...Array(maxReceivers).fill('Correo receptor estado de pago') ]

            source = source.map( (item) => {

                if (item.length < headers.length)
                    item = [ ...item, ...Array(headers.length - item.length).fill('') ]

                return item

            } )

            // Adding headers & data

            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, headers, { isHeader: true } )
            source.forEach( (data) => {addExcelRow(workbook, worksheet, data)} )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'clientes')

            this.downloading = false

        },
    },
}
</script>
