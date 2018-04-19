<template lang="pug">
    .ui.grid.aligned.container
        .row
            .ui.basic.segment
                h1.ui.header.smallcaps {{paper.title}} [{{paper.citeKey}}]
                    i.icon.file.pdf(@click="open")

                h2.ui.header.dividing Authors
                .ui.labels
                    .ui.label(v-for="author in paper.creators") {{author.firstName}} {{author.lastName}}

                h2.ui.header.dividing Abstract
                p.serif {{paper.abstractNote}}

                h3.ui.header.dividing Notes
                i.icon.edit(@click="edit")
                i.icon.sync(@click="sync")
                div.serif(v-html="note")
</template>

<script lang="ts">
import debug from "debug";
import { ipcMain, remote, shell } from "electron";
import { readFileSync, writeFileSync } from "fs-extra";
import MarkdownIt from "markdown-it";
// import MarkdownItMathJax from "markdown-it-mathjax";
// import marked from "marked";
import { fileSync } from "tmp";
import Vue from "vue";
import { mapMutations, mapState } from "vuex";


const log = debug("pepper:PDetails");

declare var MathJax: any;

const md = new MarkdownIt();
const MarkdownItMathJax: any = require("markdown-it-mathjax");
md.use(MarkdownItMathJax());

// marked.setOptions({
//     gfm: true,
// });

export default Vue.extend({
    name: "PDetails",

    computed: {
        paper() {
            const { id } = this.$route.params;
            const paper = this.pepper.$db.item[id];
            if (paper.notes.length === 0) {
                this.updateProperty({ obj: paper.notes, key: 0, value: { note: "" } });
            }
            return paper;
        },

        note() {
            const source: string = this.paper.notes[0].note || "";
            log(source);
            const escapeSource = source.replace(/\\\\/g, "\\\\\\\\");
            return md.render(source);
        },

        ...mapState(["pepper"]),
    },

    methods: {
        edit() { //
            if (this.file) {
                this.file.removeCallback();
            }
            this.file = fileSync({ prefix: "pepper-", postfix: ".md" });
            writeFileSync(this.file.name, this.paper.notes[0].note || "");
            remote.shell.openItem(this.file.name);
        },

        sync() {
            if (this.file) {
                const newNote = readFileSync(this.file.name).toString();
                this.file.removeCallback();
                // log(newNote);
                this.updateProperty({ obj: this.paper.notes[0], key: "note", value: newNote });
                this.file = null;
            }
        },

        open() {
            shell.openItem(this.pepper.composePath(this.paper.$mainFile));
        },

        ...mapMutations("pepper", ["updateProperty"]),
    },

    watch: {
        notes() {
            this.$nextTick(() => MathJax.Hub.Queue(["Typeset", MathJax.Hub]));
        },
    },

    mounted() {
        //
    },
});
</script>

<style scoped>
.smallcaps {
    font-variant: small-caps;
}

.MathJax_SVG {
    outline-width: 0px !important;
}

.serif {
    font-family: "Crimson";
    font-size: 20px;
    line-height: 1.5;
}
</style>
