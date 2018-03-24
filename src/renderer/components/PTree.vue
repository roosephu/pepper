<template lang="pug">
    .item
        i.folder.icon.fitted(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}' @click='folded = !folded')
        .floated.content(@dblclick='setCursor(folder)')
            .ui.text.bold(v-editable="folder.name"
                         :class="{blue: folder == pepper.cursor, border: isCandidate}"
                         @contextmenu="popup"
                         draggable="true"
                         @dragstart="drag(folder, 'folder')"
                         @drop="drop"
                         @dragenter="isCandidate = true"
                         @dragleave="isCandidate = false"
                         @dragover.prevent="")

        .list(v-if='!folded && hasSubfolders')
            PTree(v-for="subdir in folder.subdirs", :folder="subdir", :key="subdir._id")
</template>

<script lang="ts">
import PepperFolder, { modelFolder } from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import debug from "debug";
import { MenuItemConstructorOptions, remote } from "electron";
import Vue from "vue";
import { mapMutations, mapState } from "vuex";

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

        ...mapState("drag", {
            dragSrc: "src",
            dragType: "srcType",
        }),

        ...mapState(["pepper"]),
    },

    methods: {
        addSubfolder() {
            const subdir: PepperFolder = new PepperFolder("untitled");
            this.addSubdir({ parent: this.folder, subdir });
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },

        drop() {
            this.isCandidate = false;
            if (this.dragType === "item") {
                this.moveItem({ item: this.dragSrc, folder: this.folder });
            }
        },

        ...mapMutations("pepper", ["setCursor", "addSubdir", "removeFolder", "moveItem"]),
    },

    mounted() {
        const template = [
            { label: "New Subfolder", click: this.addSubfolder },
            { label: "Remove this folder", click: () => this.removeFolder(this.folder) },
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

