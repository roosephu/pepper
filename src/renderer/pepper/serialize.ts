import { modelAttachment } from "@/pepper/PepperAttachment";
import { modelCiter } from "@/pepper/PepperCiter";
import { modelCreator } from "@/pepper/PepperCreator";
import { modelFolder } from "@/pepper/PepperFolder";
import { modelItem } from "@/pepper/PepperItem";
import { modelLibrary } from "@/pepper/PepperLibrary";
import debug from "debug";

const log = debug("pepper:serialize");

function getNameMap(constructors: any[]): {[key: string]: any} {
    const mapConstructors: {[key: string]: () => void} = {};
    for (const c of constructors) {
        mapConstructors[c.name] = c;
    }
    return mapConstructors;
}

export const models: {[key: string]: any} = [
    modelAttachment,
    modelCiter,
    modelCreator,
    modelLibrary,
    modelFolder,
    modelItem,
].reduce((y: any, x: any) => (y[x.name] = x.func, y), {});
const nameMap = Object.keys(models).map((x) => [x, models[x]]).reduce(
    (y: any, [name, model]: any) => (y[model.name] = name, y),
    {},
);

log("models", models);

export function dumpDatabase(obj: any): any {
    const db = Object.keys(models).reduce((y: any, x: string) => (y[x] = {}, y), {});

    function clean(x: any): any {
        if (x instanceof Array) { return x.map(clean); }
        if (typeof x !== "object") { return; }
        const _constructor = x.constructor.name;
        const _ref: string = nameMap[_constructor];
        const _id: string = x._id;

        if (_ref) { // should cache
            const model = models[_constructor];
            if (db[_ref][_id]) {
                return;
            } else {
                db[_ref][_id] = x;
            }
        }

        for (const key of Object.keys(x)) {
            if (key.charAt(0) !== "$" && x[key]) {
                clean(x[key]);
            }
        }
    }
    clean(obj);

    return db;
}

export function serialize(obj: any): any {
    const db = Object.keys(models).reduce((y: any, x: string) => (y[x] = {}, y), {});

    function clean(x: any): any {
        if (x instanceof Array) { return x.map(clean); }
        if (typeof x !== "object") { return x; }
        const _constructor = x.constructor.name;
        const _ref: string = nameMap[_constructor];
        const _id: string = x._id;

        if (_ref) { // should cache
            const model = models[_constructor];
            if (db[_ref][_id]) {
                return { _id, _ref };
            } else {
                db[_ref][_id] = {};
            }
        }

        const ret: {[key: string]: any} = _ref ? db[_ref][_id] : {};
        for (const key of Object.keys(x)) {
            if (key.charAt(0) !== "$" && x[key]) {
                ret[key] = clean(x[key]);
            }
        }
        return _ref ? { _id, _ref } : ret;
    }
    let root;
    try {

        root = clean(obj);
    } catch (e) {
        //
    } finally {
        //
    }

    return { rep: JSON.stringify({ db, root }), db };
}

export function deserialize(str: string): any {
    const { db, root } = JSON.parse(str);
    const database = Object.keys(models).reduce((y: any, x: string) => (y[x] = {}, y), {});

    function build(x: any): any {
        if (x instanceof Array) { return x.map(build); }
        if (typeof x !== "object") { return x; }
        const { _id, _ref } = x;
        const model = _id && _ref && models[_ref];

        if (model) {
            x = db[_ref][_id];
            if (nameMap[x.constructor.name] === _ref) {
                return x;
            } else {
                db[_ref][_id] = Object.create(model.prototype);
            }
        }

        const ret: {[key: string]: any} = model ? db[_ref][_id] : {};
        for (const key of Object.keys(x)) {
            if (x[key]) {
                ret[key] = build(x[key]);
            }
        }
        return ret;
    }

    const obj = build(root);
    return { obj, db };
}
