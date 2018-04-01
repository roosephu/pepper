import { Model, Ref } from "@/pepper/db";
import { readBlob } from "@/pepper/translators/utils";
import Axios from "axios";
import { randomBytes } from "crypto";
import debug from "debug";
import * as fs from "fs-extra";
import { join } from "path";
import shortid from "shortid";
import PepperItem from "./PepperItem";

const log = debug("pepper:attachments");

export default class PepperAttachment {
    public mimeType: string;
    public title: string;
    public url: string;
    public _id: string;
    public entry: string;
    public $raw: Uint8Array;

    constructor(mimeType: string, title: string, url: string, paper?: PepperItem) {
        this.mimeType = mimeType;
        this.title = title;
        this.url = url;
        this._id = shortid.generate();

        if (paper) {
            const cleanTitle: string = paper.title.replace(/[^A-Za-z0-9 _.]/g, "");
            this.entry = `${paper.$formattedCreators} - ${cleanTitle}.pdf`;
        } else {
            this.entry = "paper.pdf";
        }
    }

    public async save(path: string, paper?: PepperItem) {
        path = join(path, this._id);
        if (!fs.existsSync(path)) {
            await fs.mkdirp(path);
        }

        const filePath = join(path, this.entry);
        if (this.mimeType === "application/pdf") {
            if (this.url === "local") {
                if (this.$raw) {
                    fs.writeFileSync(filePath, this.$raw);
                    this.$raw = null; // release memory
                } else {
                    log("unable to download: local file without raw data provided");
                }
            } else {
                const data = await Axios(this.url, { responseType: "blob" });
                const binary = await readBlob(data.data);
                fs.writeFileSync(filePath, binary);
            }
        }
    }
}

export const modelAttachment = new Model<PepperAttachment>("attachment", PepperAttachment);
