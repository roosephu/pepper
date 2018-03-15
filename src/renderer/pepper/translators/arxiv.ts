import axios from "axios";
import { registerTranslator } from ".";
import PepperAttachment from "../PepperAttachment";
import PepperItem from "../PepperItem";
import * as U from "./utils";

async function parse(doc: Document, url: string): Promise<PepperItem> {
    const regex = RegExp("^https?://([^\\.]+\\.)?(arxiv\\.org|xxx\\.lanl\\.gov)/(find|catchup|list/\\w|abs/|pdf/)");
    if (!regex.test(url)) {
        return undefined;
    }

    let id;
    const p = url.indexOf("/pdf/");
    if (p > -1) {
        id = url.substring(p + 5, url.length - 4);
    } else {
       id = U.xpathText(doc, '//td[contains(@class,"arxivid")]/a')
            || U.xpathText(doc, '//b[starts-with(normalize-space(text()),"arXiv:")]');
    }
    if (!id) { throw new Error("Could not find arXiv ID on page."); }

    id = id.trim().replace(/^arxiv:\s*|v\d+|\s+.*$/ig, "");
    const metadataUrl = "http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc" +
      "&identifier=oai%3AarXiv.org%3A" + encodeURIComponent(id);

    const metadata = (await axios.get(metadataUrl)).data;
    const ns = {
        dc: "http://purl.org/dc/elements/1.1/",
        n: "http://www.openarchives.org/OAI/2.0/", // Default
        oai_dc: "http://www.openarchives.org/OAI/2.0/oai_dc/",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    };

    const newItem = new PepperItem("journalArticle");
    const xml = new DOMParser().parseFromString(metadata, "text/xml");
    const dcMeta = U.xpathMatch(xml, "//n:GetRecord/n:record/n:metadata/oai_dc:dc", ns)[0];
    newItem.title = getXPathNodeTrimmed(dcMeta, "dc:title", ns);
    newItem.date = getXPathNodeTrimmed(dcMeta, "dc:date", ns);
    getCreatorNodes(dcMeta, "dc:creator", newItem, "author", ns);

    const descriptions = U.xpathMatch(dcMeta, "./dc:description", ns);
    if (descriptions.length > 0) {
        newItem.abstractNote = trimInternal(descriptions[0].textContent);
        newItem.notes.concat(descriptions.slice(1).map((x) => ({ note: trimInternal(x.textContent) })));
    }

    const subjects = U.xpathMatch(dcMeta, "./dc:subject", ns);
    newItem.tags.concat(subjects.map((sub) => trimInternal(sub.textContent)));

    const identifiers = U.xpathMatch(dcMeta, "./dc:identifier", ns);
    for (const identifier of identifiers.map((x) => x.textContent)) {
        if (identifier.substr(0, 4) === "doi:") {
           newItem.DOI = identifier.substr(4);
        } else if (identifier.substr(0, 7) === "http://") {
           newItem.url = identifier;
        }
    }

    const articleIDNode = U.xpathMatch(xml, "//n:GetRecord/n:record/n:header/n:identifier", ns)[0];
    const articleID: string = articleIDNode && trimInternal(articleIDNode.textContent).substr(14);

    let articleField = U.xpathText(xml, "//n:GetRecord/n:record/n:header/n:setSpec", ns);
    if (articleField) { articleField = "[" + articleField.replace(/^.+?:/, "") + "]"; }

    if (articleID && articleID.indexOf("/") !== -1) {
       newItem.publicationTitle = `arXiv:${articleID}`;
    } else {
       newItem.publicationTitle = `arXiv:${articleID} ${articleField}`;
    }

    newItem.extra = `arXiv: ${articleID}`;

    newItem.attachments.push(new PepperAttachment(
        "application/pdf",
        `arXiv:${articleID} PDF`,
        `http://www.arxiv.org/pdf/${articleID}.pdf`,
        newItem,
    ));
    newItem.attachments.push(new PepperAttachment(
        "text/html",
        "arXiv.org Snapshot",
        newItem.url,
        newItem,
    ));

    // TODO DOI
    return newItem;
}

function getCreatorNodes(dcMeta: Node, name: string, newItem: PepperItem, creatorType: string,
                         ns: {[s: string]: string}): void {
    const nodes = U.xpathMatch(dcMeta, `./${name}`, ns);
    for (const node of nodes) {
        newItem.creators.push(
            U.cleanAuthor(node.textContent, creatorType, true),
        );
    }
}

function trimInternal(s: string): string {
    s = s.replace(/[\xA0\r\n\s]+/g, " ");
    return s.trim();
}

function getXPathNodeTrimmed(dcMeta: Node, name: string, ns: {[s: string]: string}): string {
    const nodes = U.xpathMatch(dcMeta, `./${name}`, ns);
    if (nodes.length) {
        return trimInternal(nodes[0].textContent);
    }
    return "";
}

registerTranslator(parse);
