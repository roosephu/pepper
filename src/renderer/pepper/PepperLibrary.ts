import debug from "debug";
import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import PepperFolder from "./PepperFolder";
import PepperItem from "./PepperItem";

const log = debug("pepper:Library");

export default class PepperLibrary {
    public root: PepperFolder;
    public cursor: PepperFolder;
    // public papers: PepperItem[];
    public path: string;

    constructor() {
        this.path = join(remote.app.getPath("appData"), "Pepper", "Library");
        // console.log("main path", this.path);
        this.root = new PepperFolder("Library");
        this.cursor = this.root;
        if (!fs.existsSync(this.path)) {
            fs.mkdirpSync(this.path);
        } else if (fs.existsSync(this.dbPath)) {
            this.readDisk();
        }

        setInterval(() => this.writeDisk(), 60000);
    }

    public composePath(suf: string): string {
        return join(this.path, suf);
    }

    public async add(paper: PepperItem) {
        // console.log(paper);
        this.cursor.addItem(paper);
        await paper.writeDisk(this.path);
        await this.writeDisk();
    }

    public load(x: any) {
        this.root.load(x);
        // for (const y of x) {
        //     this.papers.push(Object.assign(new PepperItem(""), y));
        // }
        // if (x) this.papers = x
    }

    public dump(): any {
        // return this.papers;
        return this.root.dump();
    }

    public getPapers(): PepperItem[] {
        return this.root.getPapersRecursive();
        // return this.papers;
    }

    public getCursorPapers(): PepperItem[] {
        return this.cursor.getPapersRecursive();
    }

    public async writeDisk() {
        const db = JSON.stringify(this.dump(), null, 2);
        await fs.writeFile(join(this.path, "db.json"), db);
        log("Write to disk.");
    }

    get dbPath() {
        return this.composePath("db.json");
    }

    public readDisk() {
        const db = JSON.parse(fs.readFileSync(this.dbPath).toString("utf-8"));
        this.load(db);
        log("Read from disk.");
    }
}
