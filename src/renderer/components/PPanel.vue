<template lang="pug">
    .ui.grid.aligned.container
        .row
            .sixteen.wide.column
                .ui.form#urlForm
                    .ui.top.attached.tabular.menu
                        a.item.active(data-tab="addItem") Add an Item
                        a.item(data-tab="search") Search
                        a.item(data-tab="advancedSearch") Advanced Search
                    .ui.bottom.attached.tab.segment.active(data-tab="addItem")
                        .ui.three.fields
                            .twelve.wide.field
                                .ui.input.fluid
                                    input(type='text' name='url' placeholder='URL' @drop.prevent.stop="dropFiles")
                            .two.wide.field
                                a.ui.button.primary.submit Add
                    .ui.bottom.attached.tab.segment(data-tab="search")
                        .ui.two.fields
                            .ui.input.field
                                input#search(type='text' name='search' placeholder='Search...' v-model='search.regexp')
                            //- .two.wide.field
                            //-     a.ui.button.primary.submit Search
                    .ui.bottom.attached.tab.segment(data-tab="advancedSearch")
                        .field
                            textarea(type='text' name='advancedSearch' placeholder='(x, pepper) => x.title.match(/learning/i)', v-model='search.advance.script')
                        //- .field
                        //-     a.right.ui.button.primary.submit Search

        .row
            .four.wide.column
                .ui.list
                    PTree(:folder="pepper.root")
            .twelve.wide.column
                .ui.checkbox
                    input(type='checkbox', v-model="showPapersRec")
                    label show papers recursively
                table.ui.table.celled.very.compact
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
import { parse } from "@/pepper/translators/local";
import debug from "debug";
import Vue from "vue";
import { mapActions, mapMutations, mapState } from "vuex";

const log = debug("pepper:Panel");


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
            search: {
                advance: {
                    func: null,
                    script: "(x, pepper) => x",
                },
                mode: "regexp",
                regexp: "",
            },
        }; // enable Vue to track Library
    },

    methods: {
        async submit(this: any, url: string) {
            const paper = await translate(url);
            this.addItem({ paper });
        },

        async dropFiles(e: DragEvent) {
            const { files } = e.dataTransfer;
            for (const file of Array.from(files)) {
                const paper = await parse(file);
                this.addItem({ paper });
            }
        },

        ...mapMutations("pepper", ["addItem"]),
    },


    computed: {
        allPapers(this: any): PepperItem[] { // unused code
            return (this.pepper as PepperLibrary).getPapers(true);
        },

        cursorPapers() {
            return this.pepper.getCursorPapers(this.showPapersRec);
        },

        filteredPapers(): PepperItem[] {
            // log("filter!");
            const papers = this.cursorPapers;

            let filter: (x: PepperItem) => any = null;
            if (this.search.mode === "regexp") {
                if (this.search.regexp === "") { return papers; }
                const regexp = new RegExp(this.search.regexp, "i");
                filter = (x) => x.title.match(regexp);
            } else if (this.search.mode === "script") {
                const { func } = this.search.advance;
                filter = func;
            }
            return papers.filter(filter);
        },

        ...mapState(["pepper"]),
    },

    watch: {
        "search.advance.script"(newValue) {
            // used to clear filter
            newValue = newValue || "(x) => x";

            try {
                const func = new Function(`return ${newValue}`)();
                this.search.mode = "script";
                let count = 0;
                this.search.advance.func = (x: PepperItem) => {
                    try {
                        return func(x, this.pepper);
                    } catch (e) {
                        count += 1;
                        if (count < 5) {
                            log("Error when filtering", { item: x, error: e });
                        }
                        return false;
                    }
                };
                // clear error message
                $(this.$el).find("#urlForm").form("validate field" as any, "advancedSearch");
            } catch (e) {
                $(this.$el).find("#urlForm").form("add prompt", "advancedSearch", e.message);
            }
        },

        "search.regexp"() {
            this.search.mode = "regexp";
        },
    },

    mounted() {
        this.$nextTick(() => {
            const $this: any = this;
            $(this.$el).find(".ui.checkbox").checkbox();
            $(this.$el).find(".menu .item").tab();

            $(this.$el).find("#urlForm").form({
                inline: true,
                revalidate: false,
                onSuccess(e: JQuery.Event<HTMLElement>, fields: any) {
                    e.preventDefault();
                    const { url } = fields;
                    $this.submit(url);
                },
                fields: {
                    advancedSearch: "minLength[0]",
                },
            });
        });
    },
});
</script>

<style scoped>
textarea {
    font-family: "Consolas", monospace;
}

</style>
