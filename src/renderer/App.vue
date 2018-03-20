<template lang="pug">
    #app
        .ui.inverted.vertical.center.aligned.segment
            .ui.container
                .ui.large.secondary.pointing.menu.inverted
                    a.toc.item
                        i.sidebar.icon
                    a.active.item Home
                    a.item About

        .ui.stripe.vertical.segment
            .ui.grid.aligned.middle.container
                .row
                    .sixteen.wide.column
                        .ui.form#urlForm
                            .ui.two.fields
                                .fourteen.wide.field
                                    .ui.input.fluid
                                        input(type='text', name='url', placeholder='URL')
                                .two.wide.field
                                    a.ui.button.primary.submit Add

                .row
                    .four.wide.column
                        .ui.list
                            PTree(:folder="Library.root.$")
                    .twelve.wide.column
                        .ui.checkbox
                            input(type='checkbox', v-model="showPapersRec")
                            label show papers recursively
                        table.ui.table.celled.very.compact.striped
                            thead
                                tr
                                    th.collapsing.center
                                        .ui.checkbox.fitted
                                    th.twelve.wide Title
                                    th.four.wide Author
                                    th.collapsing Cite Key
                            tbody
                                PItem(v-for="paper in Library.getCursorPapers(showPapersRec)", :paper="paper", :key="paper._id")
</template>

<script lang="ts">
import PItem from "@/components/PItem.vue";
import PTree from "@/components/PTree.vue";
import Library from "@/pepper";
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
// import PDFJS from 'pdfjs-dist'
// import axios from 'axios'
import { translate } from "@/pepper/translators";
import debug from "debug";
import Vue from "vue";

// PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'

const log = debug("pepper:main");

export default Vue.extend({
    components: {
        PItem,
        PTree,
    },

    name: "pepper",

    data() {
        return {
            Library,
            showPapersRec: true,
        }; // enable Vue to track Library
    },

    methods: {
        async submit(url: string) {
            await this.$pepper.add(await translate(url));
        },

    },

    computed: {
        allPapers(): PepperItem[] {
            return this.$pepper.getPapers();
        },

    },

    mounted() {
        this.$nextTick(() => {
            const $this = this;
            $(".checkbox").checkbox();

            $("#urlForm").form({
                onSuccess(e: JQuery.Event<HTMLElement>, fields: any) {
                    e.preventDefault();
                    const { url } = fields;
                    $this.submit(url);
                },
            });
        });
    },
});

</script>

<style>
[contenteditable="true"]:focus {
    outline-width: 0px;
}

/* .ui.accordion tbody.ui.content.active {
  display: table-row-group;
} */

</style>
