import shortid from "shortid";
import PepperItem from "./PepperItem";

export default class PepperFolder {
    public subdirs: PepperFolder[]; // {[key: string]: PepperFolder};
    public papers: PepperItem[];
    public name: string;
    public parent: PepperFolder;
    public _id: string;

    constructor(name: string, papers?: PepperItem[]) {
        this.papers = papers || [];
        this.subdirs = [];
        this.name = name;
        this._id = shortid.generate();
    }

    public getPapers(recursive: boolean, result?: PepperItem[]): PepperItem[] {
        result = result || [];
        result.push(...this.papers);
        if (recursive) {
            for (const subdir of this.subdirs) {
                subdir.getPapers(recursive, result);
            }
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
        const index = this.papers.indexOf(paper);
        if (index !== -1) {
            this.papers.splice(index, 1);
        }
    }

    public removeFolder(subdir: PepperFolder) {
        // console.log(this, subdir);
        this.papers.push(...subdir.getPapers(true));
        const index = this.subdirs.indexOf(subdir);
        if (index !== -1) {
            // delete this.subdirs[index];
            this.subdirs.splice(index, 1);
        }
    }
}
