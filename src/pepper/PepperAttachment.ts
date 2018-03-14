import Axios from "axios";
import { randomBytes } from "crypto";
import * as fs from "fs-extra";
import { join } from "path";
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
    public id: string;
    public entry: string;

    constructor(mimeType: string, title: string, url: string) {
        this.mimeType = mimeType;
        this.title = title;
        this.url = url;
        this.id = randomBytes(12).toString("base64");
    }

    public async save(path: string, paper?: PepperItem) {
        path = join(path, this.id);
        if (!fs.existsSync(path)) {
            await fs.mkdirp(path);
        }

        if (this.mimeType === "application/pdf") {
            const data = await Axios(this.url, { responseType: "blob" });
            if (!this.entry) {
                if (paper) {
                    this.entry = `${paper.getCreators()} - ${paper.title}.pdf`;
                } else {
                    this.entry = "paper.pdf";
                }
            }
            await saveBlobToFile(join(path, this.entry), data.data);
        }
    }
}
