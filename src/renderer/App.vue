<template lang="pug">
  #app
    .row
      .ui.inverted.vertical.masthead.center.aligned.segment
        .ui.container
          .ui.large.secondary.pointing.menu.inverted
            a.toc.item
              i.sidebar.icon
            a.active.item Home
            a.item About

    .ui.grid
      .two.wide.column
      .eight.wide.column
        .ui.form#urlForm
          .field
            label url
            .ui.input.fluid
              input(type='text', name='url')
          a.ui.button.primary.submit Submit


    .ui.table
      thead
        tr
          th Title
          th Author
      tbody
        tr(v-for="paper in papers")
          td {{paper.title}}
          td {{paper.author}}
    //- router-view
</template>

<script>
  import { debug } from 'debug'
  import PDFJS from 'pdfjs-dist'
  import axios from 'axios'
  // import xpath from 'xpath'
  // import { DOMParser } from 'xmldom'

PDFJS.GlobalWorkerOptions.workerSrc = 'pdf.worker.js'

  const log = debug('pepper:main')

  async function test () {
    const response = await axios.get('https://arxiv.org/pdf/1505.05770.pdf')
    const { data } = response
    const pdfDoc = await PDFJS.getDocument({ data })
    log('loading successful')
    const metadata = await pdfDoc.getMetadata()
    console.log(metadata)
  }

  function xpathText (doc, expr, delimiter) {
    const result = doc.evaluate(expr, doc)
    const strings = []
    for (let node; (node = result.iterateNext());) {
      if (node.nodeType === 2 && 'value' in node) {
        strings.push(node.value)
      } else if ('textContent' in node) {
        strings.push(node.textContent)
      } else if ('text' in node) {
        strings.push(node.text)
      } else {
        strings.push(node.nodeValue)
      }
    }
    return strings.join(delimiter || ',')
  }

  class Item {
    constructor (itemType) {
      this.itemType = itemType
      this.title = undefined
    }
  }

  function xpathMatch (doc, xpath, ns) {
    let resolver = null
    if (ns) {
      resolver = (prefix) => ns[prefix] || null
    }
    const results = document.evaluate(xpath, doc, resolver)
    const ret = []
    for (let node; (node = results.iterateNext());) {
      ret.push(node)
    }
    return ret
  }

  async function parse (url) {
    // log({ url })
    // fetch(url, { mode: 'no-cors' }).then((response) => {
    //   return response.body
    // }).then((txt) => {
    //   console.log('txt', response)
    // })
    const response = await axios.get(url)
    // log({ data: response.data })
    const doc = new DOMParser().parseFromString(response.data, 'text/html')
    // log(doc)

    let id
    let p = url.indexOf('/pdf/')
    if (p > -1) {
      id = url.substring(p + 5, url.length - 4)
    } else {
      id = xpathText(doc, '//td[contains(@class,"arxivid")]/a') || xpathText(doc, '//b[starts-with(normalize-space(text()),"arXiv:")]')
    }
    if (!id) throw new Error('Could not find arXiv ID on page.')

    id = id.trim().replace(/^arxiv:\s*|v\d+|\s+.*$/ig, '')
    let metadataUrl = 'http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc' +
      '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(id)

    const metadata = (await axios.get(metadataUrl)).data
    const ns = {
      oai_dc: 'http://www.openarchives.org/OAI/2.0/oai_dc/',
      dc: 'http://purl.org/dc/elements/1.1/',
      xsi: 'http://www.w3.org/2001/XMLSchema-instance',
      n: 'http://www.openarchives.org/OAI/2.0/' // Default
    }

    const newItem = new Item('journalArticle')
    const xml = new DOMParser().parseFromString(metadata, 'text/xml')
    const dcMeta = xpathMatch(xml, '//n:GetRecord/n:record/n:metadata/oai_dc:dc', ns)[0]
    log({ dcMeta })
    newItem.title = getXPathNodeTrimmed(dcMeta, 'dc:title', ns)
    return newItem
  }

  function trimInternal (s) {
    s = s.replace(/[\xA0\r\n\s]+/g, ' ')
    return s.trim()
  }

  function getXPathNodeTrimmed (dcMeta, name, ns) {
    const nodes = xpathMatch(dcMeta, `./${name}`, ns)
    if (nodes.length) {
      return trimInternal(nodes[0].textContent)
    }
    return ''
  }

  // test()

  export default {
    name: 'pepper',

    data () {
      return {
        papers: []
      }
    },

    methods: {
      async submit (url) {
        this.papers.push(await parse(url))
      }
    },

    mounted () {
      // log(this.$electron.remote.app.getPath('appData'))
      this.$nextTick(() => {
        const $form = $('#urlForm')
        const $this = this
        $form.form({
          onSuccess (e, values) {
            e.preventDefault()
            const { url } = values
            log(url)
            $this.submit(url)
          }
        })
      })
    }
  }
</script>
