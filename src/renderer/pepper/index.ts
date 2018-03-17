import debug from "debug";
import { remote } from "electron";
import * as fs from "fs-extra";
import { join } from "path";
import _Vue, { VueConstructor } from "vue";
import { deserialize, serialize } from "./db";
import PepperAttachment from "./PepperAttachment";
import PepperCiter from "./PepperCiter";
import PepperFolder from "./PepperFolder";
import PepperItem from "./PepperItem";
import PepperLibrary from "./PepperLibrary";

const log = debug("pepper:core");

const constructors = {
    PepperAttachment,
    PepperCiter,
    PepperFolder,
    PepperItem,
    PepperLibrary,
};

const libraryPath = join(remote.app.getPath("appData"), "Pepper", "Library");

function readDisk() {
    if (!fs.existsSync(libraryPath)) {
        fs.mkdirpSync(libraryPath);
    }

    const { Library } = localStorage;
    if (Library) {
        log("Read from disk.");
        return deserialize(Library, constructors);
    } else {
        log("New library");
        return new PepperLibrary(libraryPath);
    }
}

const Library = readDisk();

import "./server";

function writeDisk() {
    localStorage.Library = serialize(Library, constructors);
    // const db = JSON.stringify(this.dump(), null, 2);
    // await fs.writeFile(join(this.path, "db.json"), db);
    log("Write to disk.");
}

setInterval(() => writeDisk, 60000);

export default Library;

function install(Vue: VueConstructor<_Vue>) {
    Vue.prototype.$pepper = Library;
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
