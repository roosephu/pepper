<template lang="pug">
    tr(@contextmenu="popup")
        td
            //- i.white.icon.calendar.online
            .ui.checkbox.fitted
                input(type="checkbox" v-model="paper.done")
            //- i.icon.calendar.check(:class="{'online': !thi}")
        td(@dblclick="open(paper)" draggable="true" @dragstart="drag")
            a(v-editable="paper.title")
        td {{paper.$formattedCreators}}
        td {{paper.citeKey}}
</template>

<script lang="ts">
// import { editable } from "@/editable";
import PepperItem from "@/pepper/PepperItem";
import debug from "debug";
import { remote, shell } from "electron";
import Vue from "vue";

const log = debug("pepper:PItem");

export default Vue.extend({
    props: {
        paper: PepperItem,
    },

    methods: {
        open(paper: PepperItem) {
            // log("dblclick");
            const attachment = paper.$mainFile;
            if (attachment) {
                shell.openItem(this.$pepper.composePath(attachment));
            }
        },

        drag(event: DragEvent) {
            // log(event, this);
            event.dataTransfer.setData("item", this.paper._id);
            this.$drag.src = this.paper;
        },

        popup() {
            this.$menu.popup(remote.getCurrentWindow());
        },

        remove() {
            this.paper.parent.$.removeItem(this.paper);
            this.paper.remove();
        },
    },

    mounted() {
        const template = [
            { label: "Remove", click: this.remove },
        ];
        this.$menu = remote.Menu.buildFromTemplate(template);
        $(".checkbox").checkbox();
    },
});

</script>
