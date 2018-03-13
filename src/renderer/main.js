import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import jquery from 'jquery'
import $ from 'jquery'
window.jQuery = jquery
window.$ = $

require('./semantic/semantic.min.js')
require('./semantic/semantic.min.css')

localStorage.debug = 'pepper:*'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
