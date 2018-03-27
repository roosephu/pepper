import PepperAttachment from "@/pepper/PepperAttachment";
import PepperItem from "@/pepper/PepperItem";
import { registerTranslator } from "@/pepper/translators";
import { cleanAuthor, xpathMatch, xpathText } from "@/pepper/translators/utils";
import debug from "debug";

const log = debug("pepper:translate:openreview");

async function parse(doc: Document, url: string): Promise<PepperItem> {
    const regexs = [
        new RegExp("https?://openreview\\.net/"),
        new RegExp("https?://papers\\.nips\\.cc/"),
        new RegExp("https?://doi\\.acm\\.org"),
    ];

    let find = false;
    for (const regex of regexs) {
        if (regex.test(url)) {
            find = true;
            break;
        }
    }
    if (!find) {
        log("URL not found: " + url);
        return null;
    }

    log("URL found: " + url);

    const item = new PepperItem(null);
    item.url = url;
    item.title = xpathText(doc, '//head/meta[@name="citation_title"]');
    item.date = xpathText(doc, '//head/meta[@name="citation_publication_date"]').replace("/", "-");
    for (const node of xpathMatch(doc, '//head/meta[@name="citation_author"]')) {
        item.creators.push(cleanAuthor((node as any).content, "author", false));
    }
    item.abstractNote = xpathText(doc,
        '//*[contains(@class, "note-content-field") and .= "Abstract:"]/following-sibling::span',
    );

    // doi.acm.org has an attribute of "citation_authors" instead of "citation_author"
    if (url.indexOf("acm.org") !== -1) {
        const authors = xpathText(doc, '//head/meta[@name="citation_authors"]') as string;
        for (let author of authors.split(";")) {
            author = author.trim();
            const names = author.split(",", 2);
            item.creators.push(cleanAuthor((names[1] + " " + names[0]), "author", false));
        }
    }

    item.attachments.push(new PepperAttachment(
        "application/pdf",
        item.title,
        xpathText(doc, '//head/meta[@name="citation_pdf_url"]'),
        item,
    ));
    return item;
}

registerTranslator(parse);
