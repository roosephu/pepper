import PepperAttachment from "@/pepper/PepperAttachment";
import PepperCreator from "@/pepper/PepperCreator";
import PepperItem from "@/pepper/PepperItem";
import { registerTranslator } from "@/pepper/translators";
import { cleanAuthor, readBlob } from "@/pepper/translators/utils";
import Axios from "axios";
import debug from "debug";
import { PDFJSStatic } from "pdfjs-dist";

const log = debug("pepper:translator:pdf");

const PDFJS: PDFJSStatic = require("pdfjs-dist");

(PDFJS as any).GlobalWorkerOptions.workerSrc = "pdf.worker.js";

function guessAuthors(rep: string): PepperCreator[] {
    log(`Guess authors from "${rep}"`);
    const authors: PepperCreator[] = [];
    let failed: string[] = rep.split(" ");
    let unresolved: string[] = [];

    // format 1: 'Last,First Last,First'
    for (const fullName of failed) {
        const index = fullName.indexOf(",");
        if (index !== -1 && index !== 0 && index !== fullName.length - 1) {
            authors.push(cleanAuthor(fullName, "author", true));
        } else {
            unresolved.push(fullName);
        }
    }
    failed = unresolved;
    unresolved = [];

    // format 2: 'First Last First Last'
    let first: string = null;
    for (const name of failed) {
        if (first) {
            authors.push(cleanAuthor(`${first} ${name}`, "author", false));
            first = null;
        } else {
            first = name;
        }
    }

    return authors;
}

async function parse(doc: Document, url: string): Promise<PepperItem> {
    const { data } = await Axios(url, { responseType: "blob" });
    const binary = await readBlob(data);
    const item = parseData(binary, url);
    return item;
}

export async function parseData(binary: Uint8Array, source: string = "local"): Promise<PepperItem> {
    const pdf = await PDFJS.getDocument(binary);
    const metadata = await pdf.getMetadata();
    const { Author, Title, CreationDate } = metadata.info;
    log("PDF metadata", metadata);

    const item = new PepperItem(null);
    item.title = Title;
    item.creators.push(...guessAuthors(Author));

    // After creators are guessed.
    item.attachments.push(new PepperAttachment(
        "application/pdf",
        Title,
        source,
        item,
    ));

    const dateRegex = /^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(.)(\d{2})'(\d{2})'$/;
    const match = (CreationDate as string).match(dateRegex);

    if (match) {
        const [year, month, day] = match.slice(1, 4);
        item.date = `${year}-${month}-${day}`;
    }
    return item;
}

registerTranslator(parse);
