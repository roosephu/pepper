import Vue from "vue";

import App from "./App.vue";


import * as jquery from "jquery";
// console.log((global as any).$, (global as any).jQuery);
(window as any).jQuery = jquery;
(window as any).$ = jquery;

require("../renderer/semantic/semantic.min.js");
require("../renderer/semantic/semantic.min.css");
require("../renderer/semantic/themes/default/assets/fonts/icons.woff2");

new Vue({
    components: { App },
    render: (h) => h(App),
}).$mount("#app");

console.log("hello world");
