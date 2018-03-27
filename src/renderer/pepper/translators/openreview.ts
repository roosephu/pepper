import PepperAttachment from "@/pepper/PepperAttachment";
import PepperItem from "@/pepper/PepperItem";
import { registerTranslator } from "@/pepper/translators";
import { cleanAuthor, xpathMatch, xpathText } from "@/pepper/translators/utils";
import debug from "debug";

const log = debug("pepper:translate:openreview");

async function parse(doc: Document, url: string): Promise<PepperItem> {
    const regex = new RegExp("https://openreview\\.net/");
    if (!regex.test(url)) {
        return null;
    }

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

    item.attachments.push(new PepperAttachment(
        "application/pdf",
        item.title,
        xpathText(doc, '//head/meta[@name="citation_pdf_url"]'),
        item,
    ));
    return item;
}

registerTranslator(parse);
