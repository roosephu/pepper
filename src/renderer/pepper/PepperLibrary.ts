import debug from "debug";
import { remote } from "electron";
import { join } from "path";
import PepperCiter from "./PepperCiter";
import PepperFolder from "./PepperFolder";
import PepperItem from "./PepperItem";

const log = debug("pepper:Library");

export default class PepperLibrary {
    public root: PepperFolder;
    public cursor: PepperFolder;
    public citer: PepperCiter;
    // public papers: PepperItem[];
    public path: string;

    constructor(path: string) {
        // console.log("main path", this.path);
        this.path = path;
        this.root = new PepperFolder("Library");
        this.cursor = this.root;
        this.citer = new PepperCiter();
    }

    public composePath(suf: string): string {
        return join(this.path, suf);
    }

    public async add(paper: PepperItem) {
        // console.log(paper);
        if (!paper.citeKey) {
            paper.citeKey = this.citer.getCiteKey(paper);
        }
        this.cursor.addItem(paper);
        await paper.writeDisk(this.path);
        // await this.writeDisk();
    }

    public getPapers(recursive: boolean): PepperItem[] {
        return this.root.getPapers(recursive);
        // return this.papers;
    }

    public getCursorPapers(recursive: boolean): PepperItem[] {
        return this.cursor.getPapers(recursive);
    }

    get dbPath() {
        return this.composePath("db.json");
    }
}
