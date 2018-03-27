import Library from "@/pepper";
import PepperCreator from "@/pepper/PepperCreator";
import PepperItem from "@/pepper/PepperItem";
import { translate } from "@/pepper/translators/index";
import Store from "@/store";
import debug from "debug";

const log = debug("pepper:importer:zotero");

export async function ImportFromZoteroJSON(lines: string): Promise<any> {
    const items = JSON.parse(lines);
    const failedItems = new Array<string>();

    /* tslint:disable:no-string-literal */
    for (const item of items) {
        try {
            Store.commit("pepper/addItem", { paper: await translate(item["URL"]) });
        } catch (e) {
            failedItems.push(item["URL"]);
        }
        break;
    }
    /* tslint:enable:no-string-literal */

    for (const item of failedItems) {
        log("Failed to import" + item);
    }
}
