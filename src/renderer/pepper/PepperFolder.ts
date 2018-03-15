import PepperItem from "./PepperItem";

export default class PepperFolder {
    public subdirs: PepperFolder[]; // {[key: string]: PepperFolder};
    public papers: PepperItem[];
    public name: string;
    public parent: PepperFolder | null;

    constructor(name: string, papers?: PepperItem[]) {
        this.papers = papers || [];
        this.subdirs = [];
        this.name = name;
    }

    public getPapersRecursive(result?: PepperItem[]): PepperItem[] {
        if (!result) {
            result = [];
        }
        result.push(...this.papers);
        for (const subdir of this.subdirs) {
            subdir.getPapersRecursive(result);
        }
        return result;
    }

    public dump(): any {
        return { subdirs: this.subdirs.map((x) => x.dump()), papers: this.papers, name: this.name };
        // const subdirs: {[key: string]: any} = {};
        // for (const [name, subdir] of Object.entries(subdirs)) {
        //     subdirs[name] = subdir.dump();
        // }
        // return {subdirs, papers: this.papers};
    }

    public load(x: any) {
        this.papers = x.papers.map((t: any) => Object.assign(new PepperItem(t.itemType), t));
        this.subdirs = [];
        this.name = x.name;
        for (const subdir of x.subdirs) {
            const sub = new PepperFolder(subdir.name);
            sub.load(subdir);
            sub.parent = this;
            this.subdirs.push(sub);
        }
    }

    public addItem(paper: PepperItem) {
        this.papers.push(paper);
    }

    public addFolder(subdir: PepperFolder) {
        //
    }

    public removeFolder(subdir: PepperFolder) {
        // console.log(this, subdir);
        this.papers.push(...subdir.getPapersRecursive());
        const index = this.subdirs.indexOf(subdir);
        if (index !== -1) {
            // delete this.subdirs[index];
            this.subdirs.splice(index, 1);
        }
    }
}
