<template lang="pug">
    tr(@contextmenu="popup")
        td
            //- i.white.icon.calendar.online
            .ui.checkbox.fitted
                input(type="checkbox" v-model="done")
            //- i.icon.calendar.check(:class="{'online': !thi}")
        td(@dblclick="open(paper)" draggable="true" @dragstart="drag({ src: paper, srcType: 'item' })")
            a(v-editable.commit="paper.title")
        td {{paper.$formattedCreators}}
        td
            p(v-editable="tags")
        td {{paper.citeKey}}
</template>

<script lang="ts">
// import { editable } from "@/editable";
import PepperItem from "@/pepper/PepperItem";
import debug from "debug";
import { remote, shell } from "electron";
import Vue from "vue";
import { mapMutations, mapState } from "vuex";

const log = debug("pepper:PItem");

export default Vue.extend({
    name: "PItem",

    props: {
        paper: PepperItem,
    },

    data() {
        return {
            tags: "",
        };
    },

    computed: {
        done: {
            get() {
                return this.paper.done;
            },

            set(value: boolean) {
                this.updateProperty({ obj: this.paper, key: "done", value });
            },
        },

        ...mapState(["pepper"]),
    },

    methods: {
        open(paper: PepperItem) {
            // log("dblclick");
            const attachment = paper.$mainFile;
            if (attachment) {
                shell.openItem(this.pepper.composePath(attachment));
            }
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },

        ...mapMutations("drag", ["drag"]),
        ...mapMutations("pepper", ["removeItem", "updateProperty"]),
    },

    watch: {
        tags(newValue: string) {
            this.updateProperty({ obj: this.paper, key: "tags", value: newValue.split(" ") });
        },
    },

    mounted() {
        const template = [
            { label: "Remove", click: () => this.removeItem(this.paper) },
        ];
        this.$menu = remote.Menu.buildFromTemplate(template);

        this.$nextTick(() => {
            $(this.$el).find(".checkbox").checkbox();
            this.tags = this.paper.tags.join(" ");
        });
    },
});

</script>
