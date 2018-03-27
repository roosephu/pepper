import Library from "@/pepper";
import PepperCreator from "@/pepper/PepperCreator";
import PepperItem from "@/pepper/PepperItem";
import { translate } from "@/pepper/translators/index";
import Store from "@/store";
import debug from "debug";

const log = debug("pepper:importer:zotero");

function redirectToAbsPage(url: string): string {
    // remove ".pdf" for nips
    if (url.indexOf("nips") >= 0) {
        if (url.substr(url.length - 3, url.length) === "pdf") {
            url = url.substr(0, url.length - 4);
        }
    }

    return url;
}


export async function ImportFromZoteroJSON(lines: string): Promise<any> {
    const items = JSON.parse(lines);
    const failedUrls = new Array<string>();

    /* tslint:disable:no-string-literal */
    for (const item of items) {
        let url: string;
        try {
            url = item["URL"] || item["Url"] || item["url"];
            url = redirectToAbsPage(url);
            log(url);
            const paperItem = await translate(url);
            if (paperItem !== undefined) {
                Store.commit("pepper/addItem", { paper: paperItem });
            }
        } catch (e) {
            failedUrls.push(url);
        }
    }
    /* tslint:enable:no-string-literal */

    for (const url of failedUrls) {
        log("Failed to import " + url);
    }
}
