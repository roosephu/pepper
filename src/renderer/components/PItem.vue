<template lang="pug">
    tr
        td
            //- i.white.icon.calendar.online
            .ui.checkbox.fitted
                input(type="checkbox", v-model="paper.done")
            //- i.icon.calendar.check(:class="{'online': !thi}")
        td(@dblclick="open(paper)")
            a(v-editable="paper.title")
        td {{paper.getCreators()}}
        td {{paper.citeKey}}
</template>

<script lang="ts">
import debug from "debug";
import Vue from "vue";
import PepperItem from "../pepper/PepperItem";

const log = debug("pepper:PItem");

export default Vue.extend({
    props: {
        paper: Object,
    },

    methods: {
        open(paper: PepperItem) {
            // log("dblclick");
            const attachment = paper.getMainFile();
            if (attachment) {
                this.$electron.shell.openItem(this.$pepper.composePath(attachment));
            }
        },
    },

    mounted() {
        //
        $(".checkbox").checkbox();
    },
});
</script>
