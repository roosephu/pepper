import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import PepperItem from "./PepperItem";

// class PepperFolder {
//     subdirs: {[key: string]: PepperFolder};
//     papers: PepperItem[];

//     constructor (papers: PepperItem[]) {
//         this.papers = papers
//     }

//     dump (): any {
//         const subdirs: {[key: string]: any} = {}
//         for (const [name, subdir] of Object.entries(subdirs)) {
//             subdirs[name] = subdir.dump()
//         }
//         return {subdirs, papers: this.papers}
//     }
// }

export default class PepperLibrary {
    // root: PepperFolder;
    public papers: PepperItem[];
    public path: string;

    constructor() {
        this.papers = [];
        this.path = join(remote.app.getPath("appData"), "Pepper", "Library");
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
        this.papers.push(paper);
        await paper.writeDisk(this.path);
        await this.writeDisk();
    }

    public load(x: any) {
        for (const y of x) {
            this.papers.push(Object.assign(new PepperItem(""), y));
        }
        // if (x) this.papers = x
    }

    public dump(): any {
        return this.papers;
        // return this.root.dump()
    }

    public getPapers(): PepperItem[] {
        return this.papers;
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
