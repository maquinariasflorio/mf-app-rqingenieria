<template>
    <div :class="{
        'mf-component': true,
        'mf-component-signature-pad': true,
        'mf-component-signature-pad-disabled': disabled,
    }"
    >
        <div ref="MfSignaturePad" class="wrapper">
            <label class="v-label v-label--active theme--light">{{ label }}</label>

            <canvas ref="SignaturePad" />
        </div>

        <v-btn block color="error" :disabled="disabled" @click.prevent="reset">
            <v-icon>mdi-delete</v-icon>
            Borrar Firma
        </v-btn>
    </div>
</template>

<script>
import SignaturePad from 'signature_pad'

export default {
    name: 'MfSignaturePad',

    props: {
        image: {
            type    : String,
            default : undefined,
        },

        label: {
            type    : String,
            default : '',
        },

        disabled: {
            type    : Boolean,
            default : false,
        },
    },

    data() {

        return {
            resizeObserver : null,
            signaturePad   : null,
            width          : 0,
            height         : 0,
        }

    },

    watch: {
        image() {

            this.setValue(this.image)

        },

        disabled() {

            if (this.disabled)
                this.signaturePad.off()
            else
                this.signaturePad.on()

        },
    },

    mounted() {

        this.signaturePad = new SignaturePad(this.$refs.SignaturePad, {
            dotSize  : 2,
            minWidth : 2,
            maxWidth : 2,
            penColor : '#003249',
        } )

        this.resizeObserver = new ResizeObserver( (entries) => {

            this.width = entries[0].contentRect.width
            this.height = entries[0].contentRect.height
            this.resizeCanvas(this.width, this.height)

        } )

        this.resizeObserver.observe(this.$refs.MfSignaturePad)

        this.setValue(this.image)

        if (this.disabled)
            this.signaturePad.off()
        else
            this.signaturePad.on()

    },

    beforeUnmount() {

        if (this.resizeObserver)
            this.resizeObserver.disconnect()

    },

    methods: {
        resizeCanvas(width, height) {

            const ratio =  Math.max(window.devicePixelRatio || 1, 1)
            const canvas = this.$refs.SignaturePad

            canvas.width = canvas.offsetWidth * ratio
            canvas.height = canvas.offsetHeight * ratio

            canvas.getContext('2d').scale(ratio, ratio)

            this.setValue(this.image)

        },

        reset() {

            this.signaturePad.clear()

        },

        setValue(value) {

            this.signaturePad.clear()

            setTimeout( () => {

                if (value)
                    this.signaturePad.fromDataURL(value)

            }, 100)

        },

        getValue() {

            return this.signaturePad.toDataURL()

        },
    },
}
</script>
