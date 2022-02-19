<template>
    <v-dialog v-model="modal"
              persistent
              width="290px"
    >
        <template #activator="{ on, attrs: actAttrs }">
            <v-text-field :value="_date"
                          :label="label"
                          readonly
                          v-bind="actAttrs"
                          :rules="rules"
                          :disabled="disabled"
                          class="mf-component mf-component-date-picker"
                          v-on="on"
            />
        </template>

        <v-date-picker :value="value"
                       scrollable
                       v-bind="attrs"
                       @input="onChangeDate"
        >
            <v-spacer />
            <v-btn text color="primary" @click="onConfirm">
                Confirmar
            </v-btn>
        </v-date-picker>
    </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
    name: 'MfDatePicker',

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

    computed: {
        _date() {

            return moment(this.value).format('DD-MM-YYYY')

        },
    },

    watch: {
        value(newValue) {

            this.privateValue = newValue

        },
    },

    methods: {
        onChangeDate(date) {

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
