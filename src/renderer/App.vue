<template lang="pug">
    #app
        .ui.inverted.vertical.center.aligned.segment
            .ui.container
                .ui.large.secondary.pointing.menu.inverted
                    a.toc.item
                        i.sidebar.icon
                    a.active.item Home
                    a.item About

        .ui.stripe.vertical.segment
            .ui.middle.aligned.container.grid.stackable
                .row
                    .two.wide.column
                    .twelve.wide.column
                        .ui.form#urlForm
                            .ui.two.fields
                                .fourteen.wide.field
                                    .ui.input.fluid
                                        input(type='text', name='url', placeholder='URL')
                                .two.wide.field
                                    a.ui.button.primary.submit Add

                .row
                    .two.wide.column
                        PepperTree(:folder="root")
                    .twelve.wide.column
                        table.ui.table.celled.compact.striped
                            thead
                                tr
                                    th Title
                                    th Author
                            tbody
                                tr(v-for="paper in lib.getPapers()", @dblclick="open(paper)")
                                    td
                                        a {{paper.title}}
                                    td {{paper.getCreators()}}
        //- router-view
</template>

<script lang="ts">
import * as debug from "debug";
import Vue from "vue";
import PepperFolder from "../pepper/PepperFolder";
import PepperItem from "../pepper/PepperItem";
import PepperLibrary from "../pepper/PepperLibrary";
// import PDFJS from 'pdfjs-dist'
// import axios from 'axios'
import { translate } from "../pepper/translators";
import PepperTree from "./components/PepperTree.vue";
// import xpath from 'xpath'
// import { DOMParser } from 'xmldom'

// PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'

const log = debug("pepper:main");

// async function test () {
//   const response = await axios.get('https://arxiv.org/pdf/1505.05770.pdf')
//   const { data } = response
//   const pdfDoc = await PDFJS.getDocument({ data })
//   log('loading successful')
//   const metadata = await pdfDoc.getMetadata()
//   console.log(metadata)
// }

// test()

const nodeA = new PepperFolder();
const nodeB = new PepperFolder();
const nodeC = new PepperFolder();
const nodeD = new PepperFolder();
const nodeE = new PepperFolder();
nodeE.subdirs.C = nodeC;
nodeE.subdirs.D = nodeD;
nodeC.subdirs.A = nodeA;
nodeC.subdirs.B = nodeB;

export default Vue.extend({
    components: {
        PepperTree,
    },

    name: "pepper",

    data() {
        return {
            lib: new PepperLibrary(),
            root: nodeE,
        };
    },

    methods: {
        async submit(url: string) {
            await this.lib.add(await translate(url));
        },

        open(paper: PepperItem) {
            const attachment = paper.getMainFile();
            if (attachment) {
                this.$electron.shell.openItem(this.lib.composePath(attachment));
            }
        },
    },

    mounted() {
      // log(this.$electron.remote.app.getPath('appData'))
      this.$nextTick(() => {
          const $form = $("#urlForm");
          const $this = this;
        //   log(this.root);

          ($form as any).form({
              onSuccess(e: Event, values: any) {
                  e.preventDefault();
                  const { url } = values;
                  $this.submit(url);
              },
          });
      });
    },
});

</script>
