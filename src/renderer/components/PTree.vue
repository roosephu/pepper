<template lang="pug">
    .item
        .right.floated
            //- i.icon.caret.left
            i.plus.icon(@click="addSubfolder")
            i.trash.icon(@click="remove")
        i.folder.icon(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}', @click='toggleFolding')
        .content
            .ui.tiny.header(v-editable="folder.name", :class="{blue: folder == $pepper.cursor}", @dblclick='gotoCursor') {{folder.name}}
        .shiftright.list(v-if='!folded && hasSubfolders')
            PTree(v-for="(subdir, $index) in folder.subdirs", :folder="subdir", :key='$index')
</template>

<script lang="ts">
import Vue from "vue";
import PepperFolder from "../pepper/PepperFolder";

export default Vue.extend({
    name: "PTree",

    props: {
        folder: Object,
    },

    data() {
        return {
            folded: true,
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
    },

    mounted() {
        //
        // console.log(this.folder);
    },
});

</script>

<style scoped>
.shiftright {
    padding-top: 0.4em !important;
    padding-left: 1.5em !important;
}

</style>

