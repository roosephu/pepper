<template lang="pug">
    .item
        //- .right.floated
        //-     //- i.icon.caret.left
        //-     i.plus.icon(@click="addSubfolder")
        //-     i.trash.icon(@click="remove")
        //- .ui.label
        //- .ui.header(@dragstart="drag" draggable="true" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave" :class="{border: candidate}")
        i.folder.icon.fitted(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}' @click='toggleFolding')
        .floated.content(@dblclick='gotoCursor')
            .ui.text.bold(v-editable="folder.name" :class="{blue: folder == $pepper.cursor, border: isCandidate}" @contextmenu="popup"
                          @dragstart="drag" draggable="true" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave") {{folder.name}}

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
            isCandidate: false,
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

        drop(event: DragEvent) {
            log(event.dataTransfer.getData("item"));
        },

        dragEnter(event: Event) {
            this.isCandidate = true;
        },

        dragLeave(event: Event) {
            this.isCandidate = false;
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

