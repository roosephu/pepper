import PepperItem from "./PepperItem";

export default class PepperFolder {
    public subdirs: {[key: string]: PepperFolder};
    public papers: PepperItem[];

    constructor(papers?: PepperItem[]) {
        this.papers = papers || [];
        this.subdirs = {};
    }

    public getPapersRecursive(result?: PepperItem[]): PepperItem[] {
        if (!result) {
            result = [];
        }
        result.concat(this.papers);
        for (const key of Object.keys(this.subdirs)) {
            this.subdirs[key].getPapersRecursive(result);
        }
        return result;
    }

    public dump(): any {
        return { subdirs: this.subdirs, papers: this.papers };
        // const subdirs: {[key: string]: any} = {};
        // for (const [name, subdir] of Object.entries(subdirs)) {
        //     subdirs[name] = subdir.dump();
        // }
        // return {subdirs, papers: this.papers};
    }

    public load(x: any) {
        //
    }

    public addItem(paper: PepperItem) {
        //
    }

    public addFolder(name: string, subdir: PepperFolder) {
        //
    }
}
