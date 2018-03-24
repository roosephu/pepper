import debug from "debug";
import shortid from "shortid";

const log = debug("pepper:db");

interface IFilterOptions {
    [key: string]: string | number |  { $le?: any; $ge?: any; $contain?: any; };
}

export function checkFilter(doc: any, options: IFilterOptions): boolean {
    for (const key of Object.keys(options)) {
        const status: boolean = false;
        const value: any = doc[key];
        const option: any = options[key];
        if ((typeof option === "number" || typeof option === "string") && (value === option)) {
            continue;
        }

        // object criteria
        if (typeof option === "object") {
            for (const rel of Object.keys(option)) {
                const operand: any = option[rel];
                if (rel === "$le" && typeof value === "number" && value <= operand) {
                    continue;
                } else if (rel === "$ge" && typeof value === "number" && value >= operand) {
                    continue;
                } else if (rel === "$contain" && typeof value === "string" && value.indexOf(operand) !== -1) {
                    continue;
                }
                return false;
            }
            continue;
        }
        return false;
    }
    return true;
}

export class Database<T> {
    public name: string;
    public kv: {[key: string]: T};

    constructor() {
        this.kv = {};
    }

    public findById(_id: string): T {
        return this.kv[_id];
    }

    public insert(doc: T): void {
        this.kv[(doc as any)._id] = doc;
    }

    public find(options: IFilterOptions): T[] {
        const ret: T[] = [];
        for (const _id of Object.keys(this.kv)) {
            const doc: T = this.kv[_id];
            if (checkFilter(doc, options)) {
                ret.push(doc);
            }
        }
        return ret;
    }
}

// const database: {[key: string]: Database<any>} = {};

// export default database;

export class Ref<T> {
    public _id: string;
    public _ref: string;
    public $: T;

   constructor(id: string, ref: string) {
       this._id = id;
       this._ref = ref;
   }
}

export class Model<T> {
    public name: string;
    public func: any;

    constructor(name: string, func: any) {
        this.name = name;
        this.func = func;
        // database[name] = new Database<T>();
    }

    public addRef(doc: any) {
        const _id = doc._id;
        const ref = doc.$ref = new Ref<T>(_id, this.name);
        ref.$ = doc;
        // database[ref._ref].insert(doc);
        return ref;
    }

    public new(...args: any[]): Ref<T> {
        const doc: any = new this.func(...args);
        doc._id = shortid.generate();
        return this.addRef(doc);
    }
}
