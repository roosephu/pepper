import PepperItem from "@/pepper/PepperItem";
import { registerTranslator } from "@/pepper/translators";
import { parseData } from "@/pepper/translators/pdf";
import { readBlob } from "@/pepper/translators/utils";
import debug from "debug";

const log = debug("pepper:translators:local");

export async function parse(file: File) {
    const data: Uint8Array = await readBlob(file);
    const item: PepperItem = await parseData(data);
    item.attachments[0].url = "local";
    item.attachments[0].$raw = data;
    return item;
}
