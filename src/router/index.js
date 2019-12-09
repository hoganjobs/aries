import Vue from 'vue'
import Router from 'vue-router'
import Login from '../pages/Login'
import Task from '../pages/Task'
import Unfinished from '../pages/Unfinished'
import Finished from '../pages/Finished'
import Welcome from '../pages/Welcome'
import Find from '../pages/Find'
import Abnormal from '../pages/Abnormal'

Vue.use(Router)

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
      path: '/task',
      name: 'task',
      component: Task
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
      path: '/find',
      name: 'find',
      component: Find
    },
    {
      path: '/abnormal',
      name: 'abnormal',
      component: Abnormal
    },
  ]
})
