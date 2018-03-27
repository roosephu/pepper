import Library from "@/pepper";
import PepperCreator from "@/pepper/PepperCreator";
import PepperItem from "@/pepper/PepperItem";
import Store from "@/store";

function getCreator(first: string, last: string): PepperCreator {
    // TODO: search existing creators from Library.$db.author
    const creator = new PepperCreator(first, last, "author");
    return creator;
}

export function ImportFromZoteroJSON(lines: string): any {
    const items = JSON.parse(lines);
    const failedItems = new Array<string>();
    for (const item of items) {
        try {
            const newItem = new PepperItem("journalArticle");

            /* tslint:disable:no-string-literal */
            newItem.title = item["title"];
            newItem.url = item["URL"];
            for (const author of item["author"]) {
                const creator = getCreator(author["given"], author["family"]);
                newItem.creators.push(creator);
            }
            /* tslint:enable:no-string-literal */

            // TODO: search existing items
            Store.commit("pepper/addItem", {paper: newItem});
        } catch (e) {
            failedItems.push(JSON.stringify(item));
        }
    }
}


