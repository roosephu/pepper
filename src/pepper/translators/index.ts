import axios from "axios";
import PepperItem from "../PepperItem";

const translators: Array<(doc: Document, url: string) => Promise<PepperItem>> = [];

function registerTranslator(translator: (doc: Document, url: string) => Promise<PepperItem>) {
    translators.push(translator);
}

async function translate(url: string): Promise<PepperItem> {

    const response = await axios.get(url);
    const doc = new DOMParser().parseFromString(response.data, "text/html");

    let ret;
    for (const translator of translators) {
        try {
            ret = ret || await translator(doc, url);
        } finally {
            //
        }
    }
    return ret;
}

export {
    registerTranslator,
    translate,
};

import "./arxiv";
