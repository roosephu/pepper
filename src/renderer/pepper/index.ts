import { remote } from "electron";
import { default as _Vue, VueConstructor } from "vue";
import PepperLibrary from "./PepperLibrary";

const Library = new PepperLibrary();

export default Library;

function install(Vue: VueConstructor<_Vue>) {
    Vue.prototype.$pepper = Library;
}

export { install };


function initMenu(globalSave: () => void): void {
    const template: any = [
        {
        label: "Edit",
        submenu: [
            {role: "undo"},
            {role: "redo"},
            {type: "separator"},
            {role: "cut"},
            {role: "copy"},
            {role: "paste"},
            {role: "pasteandmatchstyle"},
            {role: "delete"},
            {role: "selectall"},
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
            {role: "reload"},
            {role: "forcereload"},
            {role: "toggledevtools"},
            {type: "separator"},
            {role: "resetzoom"},
            {role: "zoomin"},
            {role: "zoomout"},
            {type: "separator"},
            {role: "togglefullscreen"},
        ],
        },
        {
        role: "window",
        submenu: [
            {role: "minimize"},
            {role: "close"},
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
            {role: "about"},
            {type: "separator"},
            {role: "services", submenu: []},
            {type: "separator"},
            {role: "hide"},
            {role: "hideothers"},
            {role: "unhide"},
            {type: "separator"},
            {role: "quit"},
        ],
        });

        // Edit menu
        template[1].submenu.push(
        {type: "separator"},
        {
            label: "Speech",
            submenu: [
            {role: "startspeaking"},
            {role: "stopspeaking"},
            ],
        },
        );

        // Window menu
        template[3].submenu = [
        {role: "close"},
        {role: "minimize"},
        {role: "zoom"},
        {type: "separator"},
        {role: "front"},
        ];
    }

    const menu = remote.Menu.buildFromTemplate(template);

    remote.Menu.setApplicationMenu(menu);
}

// const main = require("../renderer/main");
initMenu(() => { Library.writeDisk(); });
