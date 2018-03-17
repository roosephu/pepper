import debug from "debug";
import shortid from "shortid";

const log = debug("pepper:db");

export function serialize(obj: any, constructors: {[name: string]: any}): string {
    const db: {[_id: string]: any} = {};

    function clean(x: any): any {
        if (x instanceof Array) { return x.map(clean); }
        if (typeof x !== "object") { return x; }
        const $type = x.constructor.name;
        const shouldCache = constructors[$type];

        if (shouldCache && !x._id) {
            x._id = shortid.generate();
        }

        const { _id } = x;
        const ret: any = Object.assign({}, x);
        if (shouldCache) {
            if (db[_id]) {
                return { _id, $type };
            } else {
                // placeholder
                db[_id] = ret;
            }
        }

        for (const key of Object.keys(ret)) {
            ret[key] = clean(ret[key]);
        }

        if (shouldCache) {
            return { _id, $type };
        } else {
            return ret;
        }
    }
    const root = clean(obj);

    return JSON.stringify({ db, root });
}

export function deserialize(str: string, constructors: {[name: string]: any}): any {
    const { db, root } = JSON.parse(str);
    const cache: {[key: string]: any} = {};

    function construct(x: any): any {
        if (x instanceof Array) { return x.map(construct); }
        if (typeof x !== "object") { return x; }
        const { _id, $type } = x;

        const shouldCache = _id && $type;

        if (shouldCache) {
            if (cache[_id]) {
                return cache[_id];
            } else {
                // put a placeholder here to prevent recurrence.
                cache[_id] = new constructors[$type]();
            }
        }

        const ret = shouldCache ? db[_id] : x;
        for (const key of Object.keys(ret)) {
            ret[key] = construct(ret[key]);
        }
        if (_id && $type) {
            if (!constructors[$type]) {
                log(`detected $type=${$type} but no constructor found`);
            }
            return cache[_id] = Object.assign(cache[_id], ret);
        } else {
            return ret;
        }
    }
    return construct(root);
    // return { root: construct(root), cache };
}
