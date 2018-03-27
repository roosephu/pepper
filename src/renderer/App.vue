<template lang="pug">
    #app
        .ui.inverted.vertical.center.aligned.segment
            .ui.container
                .ui.large.secondary.pointing.menu.inverted
                    a.toc.item
                        i.sidebar.icon
                    router-link.item(:class="{ active: $route.name == 'home' }" :to="{ name: 'home' }") Home
                    router-link.item(:class="{ active: $route.name == 'settings' }" :to="{ name: 'settings' }") Settings
                    router-link.right.item(:class="{ active: $route.name == 'about' }" :to="{ name: 'about' }") About

        .ui.stripe.vertical.segment
            router-view
</template>

<script lang="ts">
import Library, { initMenu } from "@/pepper";
import debug from "debug";
import { setInterval, setTimeout } from "timers";
import Vue from "vue";
import { mapActions, mapMutations, mapState } from "vuex";

// PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'

const log = debug("pepper:main");

export default {
    name: "App",

    computed: {
        ...mapState(["pepper"]),
    },

    methods: {
        ...mapMutations("pepper", ["unsetDirty"]),
        ...mapActions("pepper", ["writeDisk"]),
    },

    mounted() {

        this.$nextTick(() => initMenu(() => this.writeDisk()));
        setInterval(() => {
            if (this.pepper.dirty) {
                this.writeDisk();
                this.unsetDirty();
            }
        }, 1000);
    },
};

</script>

<style>
[contenteditable="true"]:focus {
    outline-width: 0px;
}

/* .ui.accordion tbody.ui.content.active {
  display: table-row-group;
} */

</style>
