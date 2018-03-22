<template lang="pug">
    .item
        i.folder.icon.fitted(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}' @click='folded = !folded')
        .floated.content(@dblclick='$pepper.cursor = folder.$ref')
            .ui.text.bold(v-editable="folder.name"
                         :class="{blue: folder == $pepper.cursor.$, border: isCandidate}"
                         @contextmenu="popup"
                         draggable="true"
                         @dragstart="drag"
                         @drop="drop"
                         @dragenter="isCandiate = true"
                         @dragleave="isCandidate = false"
                         @dragover.prevent="")

        .list(v-if='!folded && hasSubfolders')
            PTree(v-for="subdir in folder.subdirs", :folder="subdir.$", :key="subdir._id")
</template>

<script lang="ts">
import PepperFolder, { modelFolder } from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import debug from "debug";
import { MenuItemConstructorOptions, remote } from "electron";
import Vue from "vue";

const log = debug("pepper:PTree");

export default Vue.extend({
    name: "PTree",

    props: {
        folder: PepperFolder,
    },

    data() {
        return {
            folded: false,
            isCandidate: false,
        };
    },

    computed: {
        hasSubfolders(): boolean {
            return this.folder.subdirs.length !== 0;
        },
    },

    methods: {
        addSubfolder() {
            const subdir: PepperFolder = modelFolder.new("untitled").$;
            this.folder.addFolder(subdir);
        },

        remove() {
            if (this.folder.parent) {
                this.folder.parent.$.removeFolder(this.folder);
            }
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },

        drop(event: DragEvent) {
            const item = event.dataTransfer.getData("item");
            this.isCandidate = false;
            if (item) {
                const paper: PepperItem = this.$drag.src;
                log(paper, this.folder);
                this.folder.addItem(paper);
            }
        },

        drag(event: DragEvent) {
            event.dataTransfer.setData("folder", this.folder._id);
        },

    },

    mounted() {
        const template = [
            { label: "New Subfolder", click: this.addSubfolder },
            { label: "Remove this folder", click: this.remove },
            // { type: "separator" as "separator" },
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

.ui.text.bold {
    font-weight: bold;
}

.ui.text.blue {
    color: #3B83C0;
}

.ui.text.border {
    border: 1px solid #3B83C0;
    /* margin: -1px; */
}

.ui.text {
    border: 1px solid transparent;
    /* margin-right: 100%; */
}

</style>

