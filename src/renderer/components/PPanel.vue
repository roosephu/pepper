<template lang="pug">
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
                    PTree(:folder="pepper.root")
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
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import PepperLibrary from "@/pepper/PepperLibrary";
import { translate } from "@/pepper/translators";
import Vue from "vue";
import { mapActions, mapMutations, mapState } from "vuex";

export default Vue.extend({
    name: "PPanel",

    components: {
        PItem,
        PTree,
    },

    data() {
        return {
            filter: { title: { $regex: "" } },
            showPapersRec: true,
        }; // enable Vue to track Library
    },

    methods: {
        async submit(this: any, url: string) {
            const paper = await translate(url);
            this.addItem({ paper });
        },

        ...mapMutations("pepper", ["addItem"]),
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

    mounted() {
        this.$nextTick(() => {
            const $this: any = this;
            $(this.$el).find(".checkbox").checkbox();

            $(this.$el).find("#urlForm").form({
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
