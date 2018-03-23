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
            .ui.grid.aligned.container
                .row
                    .sixteen.wide.column
                        .ui.form#urlForm
                            .ui.four.fields
                                .nine.wide.field
                                    .ui.input.fluid
                                        input(type='text', name='url', placeholder='URL')
                                .two.wide.field
                                    a.ui.button.primary.submit Add
                                .four.wide.field
                                    .ui.input.field
                                        input#search(type='text', name='search', placeholder='Search...', v-model='filter.title.$regex')
                                //- .two.wide.field
                                //-     a.ui.button.primary.submit Search

                .row
                    .four.wide.column
                        .ui.list
                            PTree(:folder="pepper.root.$")
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
                                    th.collapsing tags
                                    th.collapsing Cite Key
                            tbody
                                PItem(v-for="paper in filteredPapers", :paper="paper", :key="paper._id")
</template>

<script lang="ts">
import PItem from "@/components/PItem.vue";
import PTree from "@/components/PTree.vue";
import Library from "@/pepper";
import { checkFilter } from "@/pepper/db";
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import PepperLibrary from "@/pepper/PepperLibrary";
// import PDFJS from 'pdfjs-dist'
// import axios from 'axios'
import { translate } from "@/pepper/translators";
import debug from "debug";
import { remote } from "electron";
import Vue from "vue";
import { mapActions, mapState } from "vuex";

// PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'

const log = debug("pepper:main");

export default {
    components: {
        PItem,
        PTree,
    },

    name: "pepper",

    data() {
        return {
            filter: { title: { $regex: "" } },
            showPapersRec: true,
        }; // enable Vue to track Library
    },

    methods: {
        async submit(this: any, url: string) {
            const item = await translate(url);
            this.addItem(item);
        },

        ...mapActions("pepper", ["addItem"]),
    },

    computed: {
        allPapers(this: any): PepperItem[] { // unused code
            return (this.pepper as PepperLibrary).getPapers(true);
        },

        filteredPapers(): PepperItem[] {
            // const filter = this.filter;
            const papers = this.pepper.getCursorPapers(this.showPapersRec);
            if (this.filter.title.$regex === "") { return papers; }

            const regex = new RegExp(this.filter.title.$regex, "i");
            return papers.filter((x: PepperItem) => x.title.match(regex));
        },

        ...mapState(["pepper"]),
    },

    mounted(this: Vue) {
        this.$nextTick(() => {
            const $this: any = this;
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
};

</script>

<style>
[contenteditable="true"]:focus {
    outline-width: 0px;
}

/* .ui.accordion tbody.ui.content.active {
  display: table-row-group;
} */

</style>
