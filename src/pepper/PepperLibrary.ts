import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import PepperFolder from "./PepperFolder";
import PepperItem from "./PepperItem";

export default class PepperLibrary {
    public root: PepperFolder;
    // public papers: PepperItem[];
    public path: string;

    constructor() {
        // this.papers = [];
        this.path = join(remote.app.getPath("appData"), "Pepper", "Library");
        this.root = new PepperFolder();
        if (!fs.existsSync(this.path)) {
            fs.mkdirpSync(this.path);
        } else if (fs.existsSync(this.dbPath)) {
            this.readDisk();
        }
    }

    public composePath(suf: string): string {
        return join(this.path, suf);
    }

    public async add(paper: PepperItem) {
        this.root.addItem(paper);
        // this.papers.push(paper);
        await paper.writeDisk(this.path);
        await this.writeDisk();
    }

    public load(x: any) {
        // this.root.
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

    public async writeDisk() {
        const db = JSON.stringify(this.dump(), null, 2);
        await fs.writeFile(join(this.path, "db.json"), db);
    }

    get dbPath() {
        return join(this.path, "db.json");
        // return '"' + join(this.path, 'db.json') + '"'
    }

    public readDisk() {
        const db = JSON.parse(fs.readFileSync(this.dbPath).toString("utf-8"));
        // console.log(db, this.dbPath);
        this.load(db);
    }
}
