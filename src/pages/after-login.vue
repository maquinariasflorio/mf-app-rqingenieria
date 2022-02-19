<template>
    <div />
</template>

<script>
export default {
    beforeMount() {

        this.$router.push( { name: this.$auth.user.role.initialView } )

    },
}
</script>
