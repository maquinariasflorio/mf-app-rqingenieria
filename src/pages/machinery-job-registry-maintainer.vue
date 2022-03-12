<template>
    <v-container class="mf-page mf-page-machinery-job-regristry-maintainer">

        <v-data-table :headers="headers"
                      :loading="$apollo.queries.jobRegistries.loading || deleteLoading"
                      :search="search"
                      :items="jobRegistries"
                      item-key="_id"
        >

            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ title }}</v-toolbar-title>
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

            <template #[`item.date`]="{ item }">
                {{ getParsedDate(item.date) }}
            </template>

            <template #[`item.equipment`]="{ item }">
                {{ item.equipment._id ? `${item.equipment.code} | ${item.equipment.name}` : item.equipment.name }}
            </template>

            <template #[`item.signature`]="{ item }">
                {{ item.signature ? 'Si' : 'No' }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn v-if="!item.signature" icon color="primary" @click="onEdit(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn v-if="!isOperator" icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-machinery-job-registry-dialog v-model="showForm"
                                          :data="formData"
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
import { MaintenanceClasses, MachineryTypes } from './../components/MfEquipmentFormDialog'

export default {
    apollo: {
        jobRegistries: {
            query: gql`query getAllMachineryJobRegistryByUser($user: String){
                getAllMachineryJobRegistryByUser(user: $user) {
                    _id,
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
                    },
                    building,
                    bookingWorkCondition,
                    workingDayType,
                    observations,
                    equipment {
                        __typename,
                        ...on ExternalEquipment {
                            name,
                        },
                        ...on InternalEquipment {
                            _id,
                            code,
                            name,
                        },
                    },
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
                    address,
                    folio,
                }
            }`,

            update: (data) => data.getAllMachineryJobRegistryByUser,

            variables() {

                return {
                    user: this.$auth.user.role.name === 'administrator' ? undefined : this.$auth.user._id,
                }

            },

            fetchPolicy: 'network-only',
        },
    },

    data() {

        return {
            search   : '',
            showForm : false,

            deleteLoading: false,

            formData: {},

            headers: [
                {
                    text       : 'Fecha',
                    value      : 'date',
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
                    text       : 'Obra',
                    value      : 'building',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Hor. Inicial',
                    value      : 'startHourmeter',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Hor. Final',
                    value      : 'endHourmeter',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Total Horas',
                    value      : 'totalHours',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Carga',
                    value      : 'load',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Total Viajes',
                    value      : 'totalTravels',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Firmado?',
                    value      : 'signature',
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

        isOperator() {

            return this.$auth.user.role.name === 'operator'

        },
    },

    methods: {

        getParsedDate(date) {

            return moment.utc(date).format('DD-MM-YYYY')

        },

        onEdit(item) {

            this.formData = JSON.parse(JSON.stringify(item) )
            this.showForm = true

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation deleteMachineryJobRegistry($form: DeleteMachineryJobRegistryInput!) {
                    deleteMachineryJobRegistry(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteMachineryJobRegistry } } ) => {

                    if (deleteMachineryJobRegistry.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.MACHINERY_JOB_REGISTRY_DELETED)
                        this.$apollo.queries.jobRegistries.refetch()

                    }

                    if (deleteMachineryJobRegistry.__typename === GraphqlTypename.MACHINERY_JOB_REGISTRY_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_MACHINERY_JOB_REGISTRY, 'error')


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

                this.$alert(Message.EQUIPMENT_UPDATED)

                this.$apollo.queries.jobRegistries.refetch()

            }

        },
    },
}
</script>
