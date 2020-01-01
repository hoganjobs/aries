import Vue from 'vue'
import Router from 'vue-router'
import Login from '../pages/Login'
import Unfinished from '../pages/Unfinished'
import Finished from '../pages/Finished'
import Welcome from '../pages/Welcome'
import Abnormal from '../pages/Abnormal'


Vue.use(Router)
/**
 * 重写路由的push方法
 */
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/unfinished',
      name: 'unfinished',
      component: Unfinished
    },
    {
      path: '/finished',
      name: 'finished',
      component: Finished
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/abnormal',
      name: 'abnormal',
      component: Abnormal
    },
  ]
})

