import { modelAttachment } from "@/pepper/PepperAttachment";
import { modelCiter } from "@/pepper/PepperCiter";
import { modelCreator } from "@/pepper/PepperCreator";
import { modelFolder } from "@/pepper/PepperFolder";
import { modelItem } from "@/pepper/PepperItem";
import PepperLibrary, { modelLibrary } from "@/pepper/PepperLibrary";
import debug from "debug";
import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import _Vue, { VueConstructor } from "vue";
import database, { deserialize, Model, serialize } from "./db";

const log = debug("pepper:core");

function arrayToObj(pairs: Array<[string, any]>): any {
    const ret: {[key: string]: any} = {};
    for (const [key, value] of pairs) {
        ret[key] = value;
    }
    return ret;
}

const models: {[key: string]: any} = arrayToObj(([
    modelAttachment,
    modelCiter,
    modelCreator,
    modelFolder,
    modelItem,
    modelLibrary,
]).map((x) => [x.name, x] as [string, any]));

const libraryPath = join(remote.app.getPath("appData"), "Pepper", "Library");

function readDisk(): PepperLibrary {
    if (!fs.existsSync(libraryPath)) {
        fs.mkdirpSync(libraryPath);
    }

    const { Library } = localStorage;
    if (Library) {
        log("Read from disk.");
        return deserialize(Library, models);
    } else {
        log("New library");
        // return new PepperLibrary(libraryPath);
        return modelLibrary.new(libraryPath).$;
    }
}

const Library = readDisk();

Library.cleanAttachments();

import "./server";

function writeDisk(): void {
    localStorage.Library = serialize(Library.$ref);
    // const db = JSON.stringify(this.dump(), null, 2);
    // await fs.writeFile(join(this.path, "db.json"), db);
    log("Write database to disk.");

    const bibTeX = Library.getPapers(true).map((x) => x.bibTeX).join("\n\n");
    const path = Library.composePath("cite.bib");
    fs.writeFileSync(path, bibTeX);
    log(`Write bibTeX to ${path}`);
}

setInterval(writeDisk, 60000);

export default Library;

function install(Vue: VueConstructor<_Vue>) {
    Vue.prototype.$pepper = Library;
    Vue.prototype.$db = database;
    Vue.prototype.$drag = {
        dst: null,
        src: null,
    };
}

export { install };


function initMenu(globalSave: () => void): void {
    const template: any = [
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "pasteandmatchstyle" },
                { role: "delete" },
                { role: "selectall" },
                new remote.MenuItem({
                    accelerator: "cmd+s",
                    label: "Save",
                    click() {
                        globalSave();
                    },
                }),
            ],
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forcereload" },
                { role: "toggledevtools" },
                { type: "separator" },
                { role: "resetzoom" },
                { role: "zoomin" },
                { role: "zoomout" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },
        {
            role: "window",
            submenu: [
                { role: "minimize" },
                { role: "close" },
            ],
        },
        {
            role: "help",
            submenu: [
                {
                    label: "Learn More",
                    click() { remote.shell.openExternal("https://electronjs.org"); },
                },
            ],
        },
    ];

    if (process.platform === "darwin") {
        template.unshift({
            label: remote.app.getName(),
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services", submenu: [] },
                { type: "separator" },
                { role: "hide" },
                { role: "hideothers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
            ],
        });

        // Edit menu
        template[1].submenu.push(
            { type: "separator" },
            {
                label: "Speech",
                submenu: [
                    { role: "startspeaking" },
                    { role: "stopspeaking" },
                ],
            },
        );

        // Window menu
        template[3].submenu = [
            { role: "close" },
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
        ];
    }

    const menu = remote.Menu.buildFromTemplate(template);

    remote.Menu.setApplicationMenu(menu);
}

// const main = require("../renderer/main");
initMenu(writeDisk);
