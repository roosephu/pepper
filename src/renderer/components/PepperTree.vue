<template lang="pug">
    .ui.list
        .item(v-for="(subdir, name) in folder.subdirs")
            i.folder.icon
            .content
                .header {{name}}
                //- .description source
                PepperTree(:folder="subdir")
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "PepperTree",

    props: {
        folder: Object,
    },

    // beforeCreate() {
    //     this.$options.components.PepperTree = require("./PepperTree.vue");
    // },

    data() {
        return {
            // folder: {
            //     subdirs: {},
            // },
        };
    },

    mounted() {
        //
        // console.log(this.folder);
    },
});

</script>
