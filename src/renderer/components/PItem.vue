<template lang="pug">
    tr(@contextmenu="popup" :class="{'negative': done}")
        td
            //- i.white.icon.calendar.online
            .ui.checkbox.fitted
                input(type="checkbox")
            //- i.icon.calendar.check(:class="{'online': !thi}")
        td(@dblclick="open(paper)" draggable="true" @dragstart="drag({ src: paper, srcType: 'item' })")
            a(v-editable.commit="paper.title")
        td {{paper.$formattedCreators}}
        td
            p(v-editable="tags")
        td(@dblclick="$router.push({ name: 'details', params: { id: paper._id } })") {{paper.citeKey}}
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
        done() {
            return this.paper.done;
        },

        ...mapState(["pepper"]),
    },

    methods: {
        open(paper: PepperItem) {
            const attachment = paper.$mainFile;
            if (attachment) {
                const path = this.pepper.composePath(attachment);
                shell.openItem(path);
            }
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },

        moveToTrash() {
            this.moveItem({ item: this.paper, folder: this.pepper.getTrash() });
        },

        markAsRead() {
            this.updateProperty({ obj: this.paper, key: "done", value: !this.paper.done });
        },

        ...mapMutations("drag", ["drag"]),
        ...mapMutations("pepper", ["removeItem", "updateProperty", "moveItem"]),
    },

    watch: {
        tags(newValue: string) {
            this.updateProperty({ obj: this.paper, key: "tags", value: newValue.split(" ") });
        },
    },

    mounted() {
        const template = [
            { label: "Details", click: () => this.$router.push({ name: "details", params: { id: this.paper._id } }) },
            { label: "Mark as Read/Unread", click: () => this.markAsRead() },
            { type: "separator" as "separator" },
            { label: "Move to Trash", click: () => this.moveToTrash() },
        ];
        this.$menu = remote.Menu.buildFromTemplate(template);

        this.$nextTick(() => {
            $(this.$el).find(".checkbox").checkbox();
            this.tags = this.paper.tags.join(" ");
        });
    },
});

</script>
