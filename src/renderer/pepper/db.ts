import debug from "debug";
import shortid from "shortid";

const log = debug("pepper:db");

export function serialize(obj: any, constructors: {[name: string]: any}): string {
    const db: {[_id: string]: any} = {};

    function clean(x: any): any {
        if (x instanceof Array) { return x.map(clean); }
        if (typeof x !== "object") { return x; }
        const $type = x.constructor.name;
        if (constructors[$type] && !x._id) {
            x._id = shortid.generate();
        }

        const { _id } = x;
        if (db[_id]) { return db[_id]; }

        const ret: any = Object.assign({}, x);

        for (const key of Object.keys(ret)) {
            ret[key] = clean(ret[key]);
        }

        if (_id) {
            db[_id] = ret;
            return { _id, $type: x.constructor.name };
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

        if (_id && $type && cache[_id]) {
            return cache[_id];
        }

        const ret = $type && _id ? db[_id] : x;
        for (const key of Object.keys(ret)) {
            ret[key] = construct(ret[key]);
        }
        if (_id && $type) {
            if (!constructors[$type]) {
                log(`detected $type=${$type} but no constructor found`);
            }
            cache[_id] = Object.assign(new constructors[$type](), ret);
            return cache[_id];
        } else {
            return ret;
        }
    }
    return construct(root);
}
