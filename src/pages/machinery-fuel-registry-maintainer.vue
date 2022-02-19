<template>
    <v-container class="mf-page mf-page-fuel-maintainer">

        <v-data-table :headers="headers"
                      :loading="$apollo.queries.fuelRegistries.loading || deleteLoading"
                      :search="search"
                      :items="fuelRegistries"
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

            <template #[`item.equipment`]="{ item }">
                {{ item.equipment._id ? item.equipment.code : item.equipment.name }}
            </template>

            <template #[`item.operator`]="{ item }">
                {{ item.operator.name }}
            </template>

            <template #[`item.date`]="{ item }">
                {{ perseDate(item.date) }}
            </template>

            <template #[`item.type`]="{ item }">
                {{ getFuelTypeLabel(item.type) }}
            </template>

            <template #[`item.actions`]="{ item }">
                <v-btn icon color="error" @click="onDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>

        </v-data-table>


        <!--DIALOGS-->
        <mf-delete-dialog ref="deleteDialog" @confirm="onDeleteConfirm" />

    </v-container>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { Error } from '../static/errors'
import { Message } from '../static/messages'
import { GraphqlTypename } from '../static/errors/graphql_typename'
import { MaintenanceClasses, MachineryTypes } from './../components/MfEquipmentFormDialog'
import { FuelTypes } from './machinery-fuel-registry'

export default {
    apollo: {
        fuelRegistries: {
            query: gql`query getAllMachineryFuelRegistryByUser($user: String){
                getAllMachineryFuelRegistryByUser(user: $user) {
                    _id,
                    date,
                    time,
                    count,
                    hourmeter,
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
                    type,
                }
            }`,

            update: (data) => data.getAllMachineryFuelRegistryByUser,

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

            FuelTypes,

            formData: {},

            headers: [
                {
                    text       : 'Tipo',
                    value      : 'type',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Fecha',
                    value      : 'date',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Hora',
                    value      : 'time',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Equipo',
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
                    text       : 'Litros',
                    value      : 'count',
                    sortable   : true,
                    filterable : true,
                    groupable  : false,
                },
                {
                    text       : 'Horómetro',
                    value      : 'hourmeter',
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

        getFuelTypeLabel(type) {

            const fuelType = this.FuelTypes.find( (fuelType) => fuelType.value === type)

            return fuelType ? fuelType.text : ''

        },

        perseDate(date) {

            return moment.utc(date).format('DD-MM-YYYY')

        },

        onDelete(item) {

            this.$refs.deleteDialog.validate(item)

        },

        onDeleteConfirm(item) {

            this.deleteLoading = true

            this.$apollo.mutate( {
                mutation: gql`mutation deleteMachineryFuelRegistry($form: DeleteMachineryFuelRegistryInput!) {
                    deleteMachineryFuelRegistry(form: $form) {
                        __typename
                    }
                }`,

                variables: {
                    form: {
                        _id: item._id,
                    },
                },
            } )
                .then( ( { data: { deleteMachineryFuelRegistry } } ) => {

                    if (deleteMachineryFuelRegistry.__typename === GraphqlTypename.OK) {

                        this.$alert(Message.MACHINERY_FUEL_REGISTRY_DELETED)
                        this.$apollo.queries.fuelRegistries.refetch()

                    }

                    if (deleteMachineryFuelRegistry.__typename === GraphqlTypename.MACHINERY_FUEL_REGISTRY_NOT_FOUND)
                        this.$alert(Error.UNKNOWN_MACHINERY_FUEL_REGISTRY, 'error')


                    this.deleteLoading = false

                } )
                .catch( () => {

                    this.$alert(Error.DEFAULT_ERROR_MESSAGE, 'error')
                    this.deleteLoading = false

                } )

        },
    },
}
</script>
