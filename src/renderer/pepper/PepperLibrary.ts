import { Model, Ref } from "@/pepper/db";
import debug from "debug";
import { remote } from "electron";
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

    public async add(paper: PepperItem) {
        if (!paper) {
            return;
        }
        // console.log(paper);
        if (!paper.citeKey) {
            paper.citeKey = this.citer.$.getCiteKey(paper);
        }
        this.cursor.$.addItem(paper);
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

    get dbPath() {
        return this.composePath("db.json");
    }

    get structure(): any {
        function dfs(x: Ref<PepperFolder>): any {
            return {
                name: x.$.name,
                subdirs: x.$.subdirs.map(dfs),
            };
        }
        return dfs(this.root);
    }

    // public findItemById(_id: string): PepperItem {
    //     if
    // }
}

export const modelLibrary = new Model<PepperLibrary>("library", PepperLibrary);
