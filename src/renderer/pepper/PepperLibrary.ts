import { Model, Ref } from "@/pepper/db";
import PepperAttachment from "@/pepper/PepperAttachment";
import debug from "debug";
import { remote } from "electron";
import { readdir, readdirSync, remove, stat, statSync } from "fs-extra";
import { join } from "path";
import PepperCiter, { modelCiter } from "./PepperCiter";
import PepperFolder, { modelFolder } from "./PepperFolder";
import PepperItem from "./PepperItem";

const log = debug("pepper:Library");

export default class PepperLibrary {
    public root: Ref<PepperFolder>;
    public cursor: Ref<PepperFolder>;
    public citer: Ref<PepperCiter>;
    public path: string;
    public _id: string;
    public $ref: Ref<PepperLibrary>;

    constructor(path: string) {
        // console.log("main path", this.path);
        this.path = path;
        this.root = modelFolder.new("Library");
        this.cursor = this.root;
        this.citer = modelCiter.new();
    }

    public composePath(suf: string): string {
        return join(this.path, suf);
    }

    public async add(paper: PepperItem, cursor?: PepperFolder) {
        if (!paper) {
            return;
        }
        // console.log(paper);
        if (!paper.citeKey) {
            paper.citeKey = this.citer.$.getCiteKey(paper);
        }
        cursor = cursor || this.cursor.$;
        cursor.addItem(paper);
        await paper.writeDisk(this.path);
        // await this.writeDisk();
    }

    public getPapers(recursive: boolean): PepperItem[] {
        return this.root.$.getPapers(recursive);
        // return this.papers;
    }

    public getCursorPapers(recursive: boolean): PepperItem[] {
        return this.cursor.$.getPapers(recursive);
    }

    get dbPath(): string {
        return this.composePath("db.json");
    }

    get structure(): any {
        const $this = this;
        function dfs(x: Ref<PepperFolder>): any {
            const isCursor = x.$ === $this.cursor.$;
            const subdirs = x.$.subdirs.map(dfs);
            const hasCursor = isCursor || subdirs.map((t) => t.hasCursor).some((t) => t);
            return {
                name: x.$.name,
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
