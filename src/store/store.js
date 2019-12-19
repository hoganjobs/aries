import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  is_refresh: '', // 是否点击刷新
  count: 0,
  currentPlatform: {
    user_avatar: "",
    is_relation: false,
    name: "",
    user_name: "",
    platform: "",
    user_id: "",
    user: {
      name:'',
      user_id:'',
      avatar:''
    }
  },
  platformList: [],
  userInfo:null,
  currentPage: 'unfinished',
  platform_homepage: {
    autohome: 'https://i.autohome.com.cn/',
    weibo: 'https://weibo.com/'
  },
};

/**
 * mutations 里面放置的是我们操作state对象属性的方法
 */
const mutations = {
  changePage(state, n) {
    return state.currentPage = n
  },
  // 设置用户信息
  setUserInfo(state, n) {
    return state.userInfo = n
  },
  mutationsAddCount(state, n = 0) {
    return (state.count += n)
  },
  mutationsReduceCount(state, n = 0) {
    return (state.count -= n)
  },
  // 修改当前平台
  changePlatform(state,currentPlatform) {
    return (state.currentPlatform = currentPlatform)
  },
  // 点击刷新
  clickRefresh(state,is_refresh) {
    return (state.is_refresh = is_refresh)
  },
};

const actions = {
  actionsAddCount(context, n = 0) {
    console.log(context)
    return context.commit('mutationsAddCount', n)
  },
  actionsReduceCount({ commit }, n = 0) {
    return commit('mutationsReduceCount', n)
  }
};

const getters = {
  getterCount(state, n = 0) {
    return (state.count += n)
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
