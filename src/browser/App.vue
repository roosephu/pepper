<template lang="pug">
    #app
        .ui.stripe.vertical.segment
            .ui.grid.aligned.middle.container
                .row
                    .four.wide.column
                        .ui.list
                            USTree(:folder="Library")
</template>

<script lang="ts">
import axios from "axios";
import Vue from "vue";
import USTree from "./USTree";

export default Vue.extend({
    components: {
        USTree,
    },

    data() {
        return {
            Library: {
                _id: "",
                subdirs: [],
                name: "",
                hasCursor: true,
            },
        };
    },

    methods: {
        async submit() { // connect to pepper server
            //
        },
    },

    mounted() {

        const init = async () => {
            const response = await axios("http://localhost:9999");
            const { structure, cursor } = response.data;
            this.Library = structure;
            this.$cursor = cursor;
        };
        init();
    },
});
</script>
