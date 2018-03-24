import { Model, Ref } from "@/pepper/db";
import debug from "debug";
import shortid from "shortid";
import PepperItem from "./PepperItem";

const MOD = 26;

const log = debug("pepper:citer");

export default class PepperCiter {
    public citeKeys: {[key: string]: boolean};
    public _id: string;

    constructor() {
        this.citeKeys = {};
        this._id = shortid.generate();
    }

    public getCiteKey(paper: PepperItem): string {
        const { creators } = paper;
        let prefix = "";
        if (creators.length === 1) {
            const lastName = creators[0].lastName;
            prefix += lastName;
        } else if (creators.length > 3) {
            const initials = creators.slice(0, 3).map((x) => x.lastName.charAt(0)).join("");
            prefix += `${initials}${creators.length}+`;
        } else {
            const lastNameInitials = creators.map((x) => x.lastName.charAt(0)).join("");
            prefix += lastNameInitials;
        }
        prefix += ":";
        if (paper.date) {
            const year = paper.date.split("-")[0].slice(2);
            prefix += year;
        }

        const key = this.appendSuffix(prefix);
        this.citeKeys[key] = true;
        return key;
    }

    private appendSuffix(prefix: string): string {
        const index: number[] = [];
        for (let T = 0; T <= 10; ++T) {
            const suffix = String.fromCharCode(...index.map((x) => x + 97));
            const key = prefix + suffix;
            // log(prefix, suffix, key, index);

            if (!this.citeKeys[key]) {
                return key;
            }

            let step = -1;
            for (let i = 0; i < index.length; ++i) {
                if (index[i] < MOD - 1) {
                    index[i] += 1;
                    step = i;
                    break;
                }
            }
            if (step < 0) {
                step = index.length;
                index.push(0);
            }
            for (let i = 0; i < step; ++i) {
                index[i] = 0;
            }
        }
        return "???";
    }
}

export const modelCiter = new Model<PepperCiter>("citer", PepperCiter);

