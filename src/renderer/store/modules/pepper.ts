import Library from "@/pepper";
import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import PepperLibrary from "@/pepper/PepperLibrary";

const state: PepperLibrary = Library; // Object.create(PepperLibrary.prototype);

const getters = {
    //
};

const actions = {
    //
    async cleanAttachments({ state }: { state: PepperLibrary }) {
        state.cleanAttachments();
    },
};

const mutations = {
    //
    addItem(state: PepperLibrary, { paper, cursor }: { paper: PepperItem, cursor?: PepperFolder }) {
        cursor = cursor || state.cursor.$;
        state.add(paper, cursor);
        state.dirty = true;
    },

    load(state: PepperLibrary, library: PepperLibrary) {
        Object.assign(state, library);
        state.dirty = false;
    },

    setCursor(state: PepperLibrary, cursor: PepperFolder) {
        state.cursor = cursor.$ref;
    },

    addSubdir(state: PepperLibrary, { parent, subdir }: { parent: PepperFolder, subdir: PepperFolder}) {
        parent.addFolder(subdir);
        state.dirty = true;
    },

    removeFolder(state: PepperLibrary, folder: PepperFolder) {
        if (folder.parent) {
            folder.parent.$.removeFolder(folder);
            state.dirty = true;
        }
    },

    moveItem(state: PepperLibrary, { item, folder }: { item: PepperItem, folder: PepperFolder}) {
        folder.addItem(item);
        state.dirty = true;
    },

    removeItem(state: PepperLibrary, item: PepperItem) {
        item.parent.$.removeItem(item);
        item.remove();
        state.dirty = true;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
