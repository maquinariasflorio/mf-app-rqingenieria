<template>
    <v-dialog v-model="value" width="auto">
        <v-card elevation="4">
            <v-card-title>Eliminar</v-card-title>

            <v-card-text>
                <p>¿Está seguro que desea eliminar este registro?</p>

                <v-row>
                    <v-col cols="12" sm="6">
                        <v-btn color="primary" block outlined @click="value = false">
                            Cancelar
                        </v-btn>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-btn color="error" block @click="confirm">
                            Eliminar
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'MfDeleteDialog',

    data() {

        return {
            value : false,
            item  : null,
        }

    },

    methods: {
        validate(item) {

            this.item = item
            this.value = true

        },

        confirm() {

            this.value = false
            this.$emit('confirm', this.item)

        },

        cancel() {

            this.value = false

        },
    },
}
</script>
