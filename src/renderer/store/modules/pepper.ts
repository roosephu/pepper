import Library from "@/pepper";
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import PepperLibrary from "@/pepper/PepperLibrary";
import { dumpDatabase, serialize } from "@/pepper/serialize";
import debug from "debug";
import * as fs from "fs-extra";
import { Commit } from "vuex";

const log = debug("pepper:store");

const state: PepperLibrary = Library; // Object.create(PepperLibrary.prototype);

const getters = {
    //
};

const actions = {
    //
    async cleanAttachments({ state }: { state: PepperLibrary }) {
        state.cleanAttachments();
    },

    writeDisk({ state, commit }: { state: PepperLibrary, commit: Commit }) {
        const { rep: lib, db } = serialize(Library);
        commit("updateDatabase");

        localStorage.Library = lib;

        log("Write database to disk.");
        const bibTeX = Library.getPapers(true).map((x) => x.bibTeX).join("\n\n");
        const path = Library.composePath("cite.bib");
        fs.writeFileSync(path, bibTeX);
        log(`Write bibTeX to ${path}`);
    },
};

const mutations = {
    //
    addItem(state: PepperLibrary, { paper, cursor }: { paper: PepperItem, cursor?: PepperFolder }) {
        cursor = cursor || state.cursor;
        state.add(paper, cursor);
        state.dirty = true;
    },

    load(state: PepperLibrary, library: PepperLibrary) {
        Object.assign(state, library);
        state.dirty = false;
    },

    setCursor(state: PepperLibrary, cursor: PepperFolder) {
        state.cursor = cursor;
    },

    addSubdir(state: PepperLibrary, { parent, subdir }: { parent: PepperFolder, subdir: PepperFolder}) {
        parent.addFolder(subdir);
        state.dirty = true;
    },

    removeFolder(state: PepperLibrary, folder: PepperFolder) {
        if (folder.parent) {
            folder.parent.removeFolder(folder);
            state.dirty = true;
        }
    },

    moveItem(state: PepperLibrary, { item, folder }: { item: PepperItem, folder: PepperFolder}) {
        folder.addItem(item);
        state.dirty = true;
    },

    removeItem(state: PepperLibrary, item: PepperItem) {
        item.parent.removeItem(item);
        item.remove();
        state.dirty = true;
    },

    unsetDirty(state: PepperLibrary) {
        state.dirty = false;
    },

    updateDatabase(state: PepperLibrary) {
        state.$db = dumpDatabase(state);
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
