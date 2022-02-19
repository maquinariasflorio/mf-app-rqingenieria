<template>
    <v-list-item-group :value="value"
                       color="primary"
                       mandatory
                       class="mf-component mf-component-navbar-item"
                       @input="onInput"
    >

        <mf-navbar-item :items="items" />

    </v-list-item-group>
</template>

<script>
export default {
    name: 'MfNavbarItemGroup',

    props: {
        value: {
            type    : String,
            default : '',
        },

        items: {
            type     : Array,
            required : false,
            default  : () => [],
        },
    },

    methods: {
        onInput(value) {

            if (value)
                this.$emit('input', value)

        },
    },
}
</script>
