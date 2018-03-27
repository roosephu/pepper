import Vue from "vue";
import VueRouter from "vue-router";

import About from "@/components/About";
import PPanel from "@/components/PPanel";
import Settings from "@/components/Settings";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        { path: "/", component: PPanel, name: "home" },
        { path: "/about", component: About, name: "about" },
        { path: "/settings", component: Settings, name: "settings" },
        { path: "*", redirect: "/" },
    ],
});
