"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path_1 = require("path");
var url_1 = require("url");
var window;
function createWindow() {
    window = new electron_1.BrowserWindow({
        height: 600,
        width: 800
    });
    window.loadURL(url_1.format({
        pathname: path_1.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));
    window.on("closed", function () {
        window = null;
    });
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    if (window === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map