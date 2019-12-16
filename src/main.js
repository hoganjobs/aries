import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/store'
import './static/css/base.css'
import 'view-design/dist/styles/iview.css';
import ViewUI from 'view-design';
import './static/css/reset_view_design.css'
import './static/iconfont/iconfont.css'
import globalVariable from './api/globalVariable.js';

import {Message} from 'view-design';
Vue.prototype.$Msg = Message;

Vue.prototype.GLOBAL = globalVariable;


Vue.use(ViewUI);
/**
 * 验证
 */
router.beforeEach((to, from, next) => {
  if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
    if(window.location.href.indexOf('http://192.168.1.40/') < 0) {
      if(window.location.href.indexOf('/pc/') > -1) {
        window.location.href = document.location.protocol + '//' + window.location.host+ '/m/index.html#/'
        return
      }
    }

  }
  next()
})

// import Less from 'Less'

Vue.config.productionTip = false

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   store,
//   components: { App },
//   template: '<App/>'
// })
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")
