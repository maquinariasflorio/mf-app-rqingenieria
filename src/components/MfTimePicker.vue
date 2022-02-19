<template>
    <v-dialog v-model="modal"
              persistent
              width="290px"
    >
        <template #activator="{ on, attrs: actAttrs }">
            <v-text-field :value="value"
                          :label="label"
                          readonly
                          v-bind="actAttrs"
                          :rules="rules"
                          :disabled="disabled"
                          v-on="on"
            />
        </template>
        <v-time-picker :value="value"
                       full-width
                       v-bind="attrs"
                       @input="onChange"
        >
            <v-spacer />
            <v-btn text color="primary" @click="modal = false">
                Cancelar
            </v-btn>
            <v-btn text color="primary" @click="onConfirm">
                OK
            </v-btn>
        </v-time-picker>
    </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
    name: 'MfTimePicker',

    props: {
        value: {
            type    : String,
            default : null,
        },

        label: {
            type    : String,
            default : '',
        },

        rules: {
            type    : Array,
            default : () => [],
        },

        attrs: {
            type    : Object,
            default : () => ( {} ),
        },

        disabled: {
            type    : Boolean,
            default : false,
        },
    },

    data() {

        return {
            modal        : false,
            privateValue : this.value,
        }

    },

    watch: {
        value(newValue) {

            this.privateValue = newValue

        },
    },

    methods: {
        onChange(date) {

            this.privateValue = date

            this.$emit('input', date)

        },

        onConfirm() {

            this.modal = false
            this.$emit('change', this.privateValue)

        },
    },
}
</script>
