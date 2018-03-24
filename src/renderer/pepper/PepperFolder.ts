import { Model } from "@/pepper/db";
import shortid from "shortid";
import PepperItem from "./PepperItem";

export default class PepperFolder {
    public subdirs: PepperFolder[]; // {[key: string]: PepperFolder};
    public papers: PepperItem[];
    public name: string;
    public parent: PepperFolder;
    public _id: string;

    constructor(name: string, papers?: PepperItem[]) {
        this.papers = papers ? papers : [];
        this.subdirs = [];
        this.name = name;
        this._id = shortid.generate();
    }

    public getPapers(recursive: boolean = true): PepperItem[] {
        let papers: PepperItem[];
        if (!recursive) {
            papers = this.papers;
        } else {
            papers = [].concat(...this.flatten().map((x: PepperFolder) => x.papers));
        }
        return papers.map((x) => x);
    }

    public flatten(result: PepperFolder[] = []): PepperFolder[] {
        result.push(this);
        for (const subdir of this.subdirs) {
            subdir.flatten(result);
        }
        return result;
    }

    public addItem(paper: PepperItem) {
        if (paper.parent) {
            if (paper.parent !== this) {
                paper.parent.removeItem(paper);
            } else {
                return;
            }
        }
        this.papers.push(paper);
        paper.parent = this;
    }

    public addFolder(subdir: PepperFolder) {
        this.subdirs.push(subdir);
        subdir.parent = this;
    }

    public removeItem(paper: PepperItem) {
        this.papers = this.papers.filter((x) => x._id !== paper._id);
    }

    public removeFolder(subdir: PepperFolder) {
        this.papers.push(...subdir.getPapers().map((x) => x));
        this.subdirs = this.subdirs.filter((x) => x._id !== subdir._id);
    }
}

export const modelFolder = new Model<PepperFolder>("folder", PepperFolder);
