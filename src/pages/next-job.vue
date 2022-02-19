<template>
    <v-container class="mf-page mf-page-next-job">
        <v-card :loading="$apollo.queries.nextJob.loading || $apollo.queries.equipments.loading || $apollo.queries.client.loading">
            <v-card-text>

                <v-alert text type="info">
                    La siguiente información le indica dónde es su siguiente trabajo.
                </v-alert>

                <mf-date-picker :value="new Date().toISOString().substr(0, 10)"
                                label="Fecha"
                                disabled
                />

                <v-text-field :value="_equipment"
                              label="Maquinaria"
                              disabled
                />

                <v-text-field :value="client ? client.name : ''"
                              label="Cliente"
                              disabled
                />

                <v-text-field :value="nextJob ? nextJob.building : ''"
                              label="Obra"
                              disabled
                />

                <v-text-field :value="nextJob ? nextJob.address : ''"
                              label="Dirección"
                              disabled
                />

            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
    apollo: {
        nextJob: {
            query: gql`query getUserNextJob($user: String!, $date: String!) {
                getUserNextJob(user: $user, date: $date) {
                    __typename,
                    company,
                    client,
                    building,
                    machines {
                        operator,
                        equipment,
                    },
                    address,
                }
            }`,

            update( { getUserNextJob } ) {

                const nextJob = getUserNextJob.length ? getUserNextJob[0] : {}
                this.equipment = nextJob.machines ? nextJob.machines[0].equipment : ''

                return nextJob

            },

            variables() {

                return {
                    user : this.$auth.user._id,
                    date : new Date().toISOString(),
                }

            },

            fetchPolicy: 'network-only',
        },

        equipments: {
            query: gql`query getAllEquipmentsByBuilding($user: String!, $date: String!) {
                getAllEquipmentsByBuilding(user: $user, date: $date) {
                    __typename,
                    ...on EquipmentsByBooking {
                        equipments {
                            _id,
                            type,
                            name,
                            code,
                            patent,
                            workCondition,
                        }
                    }
                    ...on ExternalEquipmentsByBooking {
                        externalEquipments: equipments {
                            _id,
                            type,
                            minHours,
                            workCondition,
                        }
                    }
                }
            }`,

            update( { getAllEquipmentsByBuilding } ) {

                const isOperator = getAllEquipmentsByBuilding.__typename === 'EquipmentsByBooking'
                const equipments = isOperator
                    ? getAllEquipmentsByBuilding.equipments
                    : getAllEquipmentsByBuilding.externalEquipments

                return equipments

            },

            variables() {

                return {
                    user : this.$auth.user._id,
                    date : new Date().toISOString(),
                }

            },

            fetchPolicy: 'network-only',
        },

        client: {
            query: gql`query getClient($client: String!) {
                getClient(client: $client) {
                    _id,
                    name,
                }
            }`,

            update( { getClient } ) {

                return getClient

            },

            variables() {

                return {
                    client: this.nextJob ? this.nextJob.client : null,
                }

            },
        },
    },

    data() {

        return {
            equipment  : null,
            equipments : [],
        }

    },

    computed: {
        _equipment() {

            const equipment = this.equipments.find( (equipment) => equipment._id === this.equipment)

            if (equipment) {

                return this.$auth.user.role.name === 'operator'
                    ? `${equipment.code} | ${equipment.patent} | ${equipment.name}`
                    : `${equipment._id}`

            }

            return ''

        },
    },
}
</script>
