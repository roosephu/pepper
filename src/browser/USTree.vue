<template lang="pug">
    .item
        i.folder.icon.fitted(:class='{"outline": !hasSubfolders, "open": hasSubfolders && folded}' @click='toggleFolding')
        .content
            .ui.text.bold(:class="{blue: isCursor, border: hover}" @mouseover="mouseOver" @mouseout="mouseOut" @click='send') {{folder.name}}
            p(v-if="success") Success

        .list(v-if='!folded && hasSubfolders')
            USTree(v-for="subdir in folder.subdirs", :folder="subdir", :key="subdir._id")
</template>

<script lang="ts">
import axios from "axios";
import { setInterval, setTimeout } from "timers";
import Vue from "vue";

declare var chrome: any;

export default Vue.extend({
    name: "USTree",

    props: {
        folder: Object,
    },

    data() {
        return {
            folded: false,
            hover: false,
            success: false,
        };
    },

    computed: {
        hasSubfolders(): boolean {
            return this.folder.subdirs.length !== 0;
        },

        isCursor(): boolean {
            return this.folder.hasCursor && !this.folder.subdirs.map((x: any) => x.hasCursor).some((x: any) => x);
        },
    },

    watch: {
        folder() {
            this.folded = this.isCursor || !this.folder.hasCursor;
        },
    },

    methods: {
        toggleFolding() {
            this.folded = !this.folded;
        },

        send() {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: any) => {
                const { url } = tabs[0];
                const { data } = await axios.post("http://localhost:9999/add", {
                    url,
                    cursor: this.folder._id,
                });
                if (data === "success") {
                    this.success = true;
                }
                // setInterval(window.close, 1000);
            });
        },

        mouseOver() {
            this.hover = true;
        },

        mouseOut() {
            this.hover = false;
        },
    },

    mounted() {
        this.folded = this.isCursor || !this.folder.hasCursor;
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
    cursor: pointer;
    /* margin-right: 100%; */
}

</style>
