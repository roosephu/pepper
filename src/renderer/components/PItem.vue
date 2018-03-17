<template lang="pug">
    tr(draggable="true", @dragstart="drag")
        td
            //- i.white.icon.calendar.online
            .ui.checkbox.fitted
                input(type="checkbox", v-model="paper.done")
            //- i.icon.calendar.check(:class="{'online': !thi}")
        td(@dblclick="open(paper)")
            a(v-editable="paper.title")
        td {{paper.formattedCreators}}
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
            const attachment = paper.mainFile;
            if (attachment) {
                this.$electron.shell.openItem(this.$pepper.composePath(attachment));
            }
        },

        drag(event: DragEvent) {
            // log(event, this);
            event.dataTransfer.setData("item", this.paper._id);
        },
    },

    mounted() {
        //
        $(".checkbox").checkbox();
    },
});
</script>
