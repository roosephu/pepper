import { Database, Model, Ref } from "@/pepper/db";
import PepperAttachment from "@/pepper/PepperAttachment";
import PepperCiter from "@/pepper/PepperCiter";
import PepperCreator from "@/pepper/PepperCreator";
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import debug from "debug";
import { remote } from "electron";
import { readdir, readdirSync, remove, stat, statSync } from "fs-extra";
import { join } from "path";
import shortid from "shortid";


const log = debug("pepper:Library");

export default class PepperLibrary {
    public root: PepperFolder;
    public cursor: PepperFolder;
    public citer: PepperCiter;
    public path: string;
    public _id: string;
    public dirty: boolean;
    public trash: PepperFolder;
    public $db: {[key: string]: {[key: string]: any}};

    constructor(path: string) {
        // console.log("main path", this.path);
        this.path = path;
        this.root = new PepperFolder("Library");
        this.cursor = this.root;
        this.dirty = false;
        this.citer = new PepperCiter();
        this._id = shortid.generate();
        this.trash = new PepperFolder("Trash");
        this.root.addFolder(this.trash);

        this.$db = {};
    }

    public getTrash(): PepperFolder {
        if (!this.trash) {
            this.trash = new PepperFolder("Trash");
            this.root.addFolder(this.trash);
        }
        return this.trash;
    }

    public composePath(suf: string): string {
        return join(this.path, suf);
    }

    public async add(paper: PepperItem, cursor?: PepperFolder) {
        if (!paper) { return; }
        if (!paper.citeKey) {
            paper.citeKey = this.citer.getCiteKey(paper);
        }
        cursor = cursor || this.cursor;
        cursor.addItem(paper);
        await paper.writeDisk(this.path);
    }

    public getPapers(recursive: boolean): PepperItem[] {
        return this.root.getPapers(recursive);
    }

    public getCursorPapers(recursive: boolean): PepperItem[] {
        return this.cursor.getPapers(recursive);
    }

    get dbPath(): string {
        return this.composePath("db.json");
    }

    get structure(): any {
        const $this = this;
        function dfs(x: PepperFolder): any {
            const isCursor = x === $this.cursor;
            const subdirs = x.subdirs.map(dfs);
            const hasCursor = isCursor || subdirs.map((t) => t.hasCursor).some((t) => t);
            return {
                name: x.name,
                _id: x._id,
                subdirs,
                hasCursor,
            };
        }
        return dfs(this.root);
    }

    public async cleanAttachments(): Promise<void> {
        const papers: PepperItem[] = this.getPapers(true);
        const usedAttachments: PepperAttachment[] = [].concat(...papers.map((x) => x.attachments));
        const usedIDs = new Set(usedAttachments.map((x) => x._id));

        const savedIDs: string[] = readdirSync(this.path).filter(
            (x) => statSync(this.composePath(x)).isDirectory(),
        );
        const unusedIDs = savedIDs.filter((x) => !usedIDs.has(x));
        // log(unusedIDs);
        Promise.all(unusedIDs.map((x) => remove(this.composePath(x))));
    }
}

export const modelLibrary = new Model<PepperLibrary>("library", PepperLibrary);
