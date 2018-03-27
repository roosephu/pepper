<template lang="pug">
    .ui.grid.aligned.container
        .row
            .sixteen.wide.column
                .ui.form.basic.segment#importForm
                    h1.ui.header Import
                    .ui.four.fields
                        //- .nine.wide.field
                        //-     .ui.fluid.action.input
                        //-         input#filename(type='text' readonly @click="select")
                        //-         input#upload(type='file' hidden name="upload" @change="setPath")
                        //-         .ui.button#select(@click="select")
                        //-             | select
                        .three.wide.field
                            .ui.primary.button(@click='importLibrary')
                                | Import
                        .three.wide.field
                            .ui.primary.button(@click='exportLibrary')
                                | Export
</template>

<script lang="ts">
import debug from "debug";
import { remote } from "electron";
import Vue from "vue";

const log = debug("pepper:settings");

export default Vue.extend({
    name: "Settings",

    data() {
        return {
            disabledImport: true,
        };
    },

    methods: {
        importLibrary(): void {
            const files: string[] = remote.dialog.showOpenDialog({
                filters: [{ name: "JSON Files", extensions: ["json"] }],
                properties: ["openFile"],
            });
            if (files && files.length) {
                const file = files[0];
                log("Do what you want to do", file);
                // log("files", files);
            }
        },

        exportLibrary(): void {
            //
        },
    },

    mounted() {
        // this.$nextTick(() => );
    },
});
</script>
