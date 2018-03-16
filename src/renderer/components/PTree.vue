<template lang="pug">
    .item
        //- .right.floated
        //-     //- i.icon.caret.left
        //-     i.plus.icon(@click="addSubfolder")
        //-     i.trash.icon(@click="remove")
        i.folder.icon(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}', @click='toggleFolding')
        .content(@dblclick='gotoCursor')
            .ui.tiny.header(v-editable="folder.name", :class="{blue: folder == $pepper.cursor}", @contextmenu="popup") {{folder.name}}
        .list(v-if='!folded && hasSubfolders')
            PTree(v-for="subdir in folder.subdirs", :folder="subdir", :key="subdir._id")
</template>

<script lang="ts">
import debug from "debug";
import { MenuItemConstructorOptions, remote } from "electron";
import Vue from "vue";
import PepperFolder from "../pepper/PepperFolder";

const log = debug("pepper:PTree");

export default Vue.extend({
    name: "PTree",

    props: {
        folder: Object,
    },

    data() {
        return {
            folded: false,
        };
    },

    computed: {
        hasSubfolders(): boolean {
            return this.folder.subdirs.length !== 0;
        },
    },

    methods: {
        toggleFolding() {
            // console.log("fold", this.folder.name);
            this.folded = !this.folded;
        },

        addSubfolder() {
            // console.log("???");
            const subdir = new PepperFolder("untitled");
            subdir.parent = this.folder;
            this.folder.subdirs.push(subdir);
        },

        remove() {
            if (this.folder.parent) {
                this.folder.parent.removeFolder(this.folder);
            }
        },

        gotoCursor() {
            this.$pepper.cursor = this.folder;
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },
    },

    mounted() {
        const template = [
            { label: "New Subfolder", click: this.addSubfolder },
            { label: "Remove this folder", click: this.remove },
            // { type: "separator" as "separator" },
            // { label: "hello" },
        ];
        this.$menu = remote.Menu.buildFromTemplate(template);
    },
});

</script>

<style scoped>
.list {
    padding-top: 0.4em !important;
    padding-left: 1.5em !important;
}

</style>

