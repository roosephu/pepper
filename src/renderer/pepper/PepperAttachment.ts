import { Model, Ref } from "@/pepper/db";
import Axios from "axios";
import { randomBytes } from "crypto";
import * as fs from "fs-extra";
import { join } from "path";
import shortid from "shortid";
import PepperItem from "./PepperItem";


function saveBlobToFile(path: string, blob: Blob): Promise<string> {
    return new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            fs.writeFileSync(path, new Buffer(new Uint8Array(this.result)));
            resolve(path);
        };
        fileReader.readAsArrayBuffer(blob);
    });
}

export default class PepperAttachment {
    public mimeType: string;
    public title: string;
    public url: string;
    public _id: string;
    public $ref: Ref<PepperAttachment>;
    public entry: string;

    constructor(mimeType: string, title: string, url: string, paper?: PepperItem) {
        this.mimeType = mimeType;
        this.title = title;
        this.url = url;
        this._id = shortid.generate();

        if (paper) {
            this.entry = `${paper.$formattedCreators} - ${paper.title}.pdf`;
        } else {
            this.entry = "paper.pdf";
        }
    }

    public async save(path: string, paper?: PepperItem) {
        path = join(path, this._id);
        if (!fs.existsSync(path)) {
            await fs.mkdirp(path);
        }

        if (this.mimeType === "application/pdf") {
            const data = await Axios(this.url, { responseType: "blob" });
            await saveBlobToFile(join(path, this.entry), data.data);
        }
    }

}

export const modelAttachment = new Model<PepperAttachment>("attachment", PepperAttachment);

