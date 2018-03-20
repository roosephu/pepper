import { Model, Ref } from "@/pepper/db";
import shortid from "shortid";
import PepperItem from "./PepperItem";

export default class PepperFolder {
    public subdirs: Array<Ref<PepperFolder>>; // {[key: string]: PepperFolder};
    public papers: Array<Ref<PepperItem>>;
    public name: string;
    public parent: Ref<PepperFolder>;
    public _id: string;
    public $ref: Ref<PepperFolder>;

    constructor(name: string, papers?: PepperItem[]) {
        this.papers = papers ? papers.map((x) => x.$ref) : [];
        this.subdirs = [];
        this.name = name;
        this._id = shortid.generate();
    }


    public getPapers(recursive: boolean, result?: PepperItem[]): PepperItem[] {
        result = result || [];
        result.push(...this.papers.map((x) => x.$));
        if (recursive) {
            for (const subdir of this.subdirs) {
                subdir.$.getPapers(recursive, result);
            }
        }
        return result;
    }

    public addItem(paper: PepperItem) {
        if (paper.parent) {
            if (paper.parent.$ !== this) {
                paper.parent.$.removeItem(paper);
            } else {
                return;
            }
        }
        this.papers.push(paper.$ref);
        paper.parent = this.$ref;
    }

    public addFolder(subdir: PepperFolder) {
        this.subdirs.push(subdir.$ref);
        subdir.parent = this.$ref;
    }

    public removeItem(paper: PepperItem) {
        this.papers = this.papers.filter((x) => x._id !== paper._id);
        // const index = this.papers.indexOf(paper);
        // if (index !== -1) {
        //     this.papers.splice(index, 1);
        // }
    }

    public removeFolder(subdir: PepperFolder) {
        // console.log(this, subdir);
        this.papers.push(...subdir.getPapers(true).map((x) => x.$ref));
        this.subdirs = this.subdirs.filter((x) => x._id !== subdir._id);
        // const index = this.subdirs.indexOf(subdir);
        // if (index !== -1) {
        //     // delete this.subdirs[index];
        //     this.subdirs.splice(index, 1);
        // }
    }
}

export const modelFolder = new Model<PepperFolder>("folder", PepperFolder);
