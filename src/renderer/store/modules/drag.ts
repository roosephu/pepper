import PepperFolder from "@/pepper/PepperFolder";
import PepperItem from "@/pepper/PepperItem";
import { StoreOptions } from "vuex";

interface IDragState {
    src: PepperItem | PepperFolder;
    srcType: "item" | "folder" | "";
}

const state: IDragState = {
    src: null,
    srcType: "",
};

const getters = {
    //
};

const mutations: {[type: string]: any} = {
    drag(state: IDragState, { src, srcType }: IDragState) {
        state.src = src;
        state.srcType = srcType;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
};
