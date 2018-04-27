import PepperLibrary from "@/pepper/PepperLibrary";
import { deserialize, dumpDatabase, serialize } from "@/pepper/serialize";
import debug from "debug";
import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import _Vue, { VueConstructor } from "vue";


const log = debug("pepper:core");

function arrayToObj(pairs: Array<[string, any]>): {[key: string]: any} {
    // return pairs.reduce((y: any, [key, val]: [string, any]) => (y[key] = val, y), {});
    const ret: {[key: string]: any} = {};
    for (const [key, value] of pairs) {
        ret[key] = value;
    }
    return ret;
}

const libraryPath = join(remote.app.getPath("appData"), "Pepper", "Library");

function readDisk(): PepperLibrary {
    if (!fs.existsSync(libraryPath)) {
        fs.mkdirpSync(libraryPath);
    }

    const { Library } = localStorage;
    if (Library) {
        log("Read from disk.");
        const { obj: lib, db } = deserialize(Library);
        lib.$db = db;
        return lib;
    } else {
        log("New library");
        // return new PepperLibrary(libraryPath);
        const lib = new PepperLibrary(libraryPath);
        lib.$db = dumpDatabase(lib);
        return lib;
    }
}

const Library = readDisk();
Library.cleanAttachments();
log(Library.path);

export default Library;

export function initMenu(globalSave: () => void): void {
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
