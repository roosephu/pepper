import axios from "axios";
import Vue from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";

import * as jquery from "jquery";
// console.log((global as any).$, (global as any).jQuery);
(window as any).jQuery = jquery;
(window as any).$ = jquery;

require("./semantic/semantic.min.css");
require("./semantic/semantic.min.js");
require("./semantic/themes/default/assets/fonts/icons.woff2");

// import VueElectron from "vue-electron";

localStorage.debug = "pepper:*";

if (!process.env.IS_WEB) { Vue.use(require("vue-electron")); }
// Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

import Editable from "./editable";

Vue.use(Editable);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");

import "./server";
