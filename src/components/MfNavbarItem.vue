<template>
    <div class="mf-component mf-component-navbar-item">
        <template v-for="item in _items">
            <v-list-item v-if="!item.children || item.children.length === 0" :key="item._id" :value="item.name" @click="link(item)">
                <v-list-item-icon>
                    <v-icon v-text="item.icon" />
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title v-text="item.label" />
                </v-list-item-content>
            </v-list-item>

            <v-list-group v-else
                          :key="item._id"
                          :prepend-icon="item.icon"
                          no-action
                          mandatory
            >
                <template #activator>
                    <v-list-item-title>{{ item.label }}</v-list-item-title>
                </template>

                <mf-navbar-item :items="item.children" />
            </v-list-group>
        </template>
    </div>
</template>

<script>
export default {
    name: 'MfNavbarItem',

    props: {
        items: {
            type     : Array,
            required : false,
            default  : () => [],
        },
    },

    computed: {
        _items() {

            return this.items ? this.items : []

        },
    },

    methods: {
        link(item) {

            this.$store.commit('navbar/setProp', {
                title: item.label,
            } )
            this.$router.push( { name: item.name } )

        },
    },
}
</script>
