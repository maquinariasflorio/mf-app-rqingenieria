<template>
    <v-container class="mf-page mf-page-staff">
        <v-data-table :headers="headers"
                      :loading="$apollo.queries.users.loading || deleteLoading || downloading"
                      :search="search"
                      :items="users"
                      item-key="_id"
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>

                    <v-spacer />

                    <v-btn icon
                           dark
                           color="primary"
                           :disabled="$apollo.queries.users.loading || deleteLoading || downloading"
                           style="margin-right: 10px"
                           @click="downloadTable"
                    >
                        <v-icon>
                            mdi-file-download-outline
                        </v-icon>
                    </v-btn>

                    <v-btn :disabled="$apollo.queries.users.loading || deleteLoading || downloading" color="primary" @click.stop="onNew">
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

            <template #[`item.role`]="{ item }">
                {{ getRoleLabelById(item.role) }}
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
        <mf-user-form-dialog v-model="showUserForm"
                             :roles="roles"
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
        users: {
            query: gql`query {
                getAllUsers {
                    _id,
                    rut,
                    email,
                    name,
                    role,
                    signature,
                }
            }`,
            update: (data) => data.getAllUsers,
        },

        roles: {
            query: gql`query {
                getAllRoles {
                    _id,
                    name,
                    label,
                }
            }`,
            update: (data) => data.getAllRoles,
        },
    },

    data() {

        return {
            downloading  : false,
            search       : '',
            showUserForm : false,
            isNew        : true,

            deleteLoading: false,

            formData: {},

            headers: [
                {
                    text       : 'RUT',
                    value      : 'rut',
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
                    text       : 'Correo Electrónico',
                    value      : 'email',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                    exportable : true,
                },
                {
                    text       : 'Rol',
                    value      : 'role',
                    sortable   : true,
                    filterable : true,
                    groupable  : true,
                    exportable : true,
                },
                {
                    text       : 'Acciones',
                    value      : 'actions',
                    sortable   : false,
                    filterable : false,
                    groupable  : false,
                },
            ],

            roles: [],
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
            this.showUserForm = true

        },

        onEdit(item) {

            this.isNew = false
            this.formData = JSON.parse(JSON.stringify(item) )
            this.showUserForm = true

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation ($form: DeleteUserInput!) {
                    deleteUser(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteUser } } ) => {

                    if (deleteUser.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.USER_DELETED)
                        this.$apollo.queries.users.refetch()

                    }

                    if (deleteUser.__typename === GraphqlTypename.USER_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_USER, 'error')


                    if (deleteUser.__typename === GraphqlTypename.IMMUTABLE_USER)
                        this.$alert(Error.IMMUTABLE_USER, 'error')


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
                    this.$alert(Message.USER_CREATED)
                else
                    this.$alert(Message.USER_UPDATED)

                this.$apollo.queries.users.refetch()

            }

        },

        getRoleLabelById(id) {

            const role = this.roles.find( (role) => role._id === id)

            return role ? role.label : ''

        },

        prepareSourceForExport() {

            return this.users.map( (item) => {

                return {
                    rut   : item.rut,
                    name  : item.name,
                    email : item.email,
                    role  : this.getRoleLabelById(item.role),
                }

            } )

        },

        downloadTable() {

            this.downloading = true

            const { workbook, worksheet } = newWorkbook( { name: 'Personal' } )

            const headers = this.headers.filter( (h) => h.exportable).map( (h) => h.text)
            const source = this.users.map( (item) => {

                return [
                    item.rut,
                    item.name,
                    item.email,
                    this.getRoleLabelById(item.role),
                ]

            } )

            setExcelHeader(workbook, worksheet)

            addExcelRow(workbook, worksheet, headers, { isHeader: true } )
            source.forEach( (data) => {addExcelRow(workbook, worksheet, data)} )

            autoWidth(worksheet)
            saveExcelFile(workbook, 'personal')

            this.downloading = false

        },
    },
}
</script>
