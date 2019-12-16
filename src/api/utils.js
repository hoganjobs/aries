import Vue from 'vue'
import store from '../store/store'
import router from '../router'
import Watermark from '../api/watermark'
import * as API from '../api/api'
import '../static/css/base.css'
import 'view-design/dist/styles/iview.css';
import '../static/css/reset_view_design.css'
import iView ,{Message} from 'view-design';

Vue.use(Message);
Vue.use(iView);

Vue.use(router);
Vue.use(store);
var _ = this;


/**
 * 心跳
 * @param
 */
export const heartbeat = () => {
    var timer;
    clearTimeout(timer);
    API.heartbeat().then(function (res) {
        var _d = res.data
        if(_d) {
            if(_d.code == 1002) { // 登录过期
                clearTimeout(timer);
                blToast('登录已过期，请您重新登录')
            }else if(_d.code == 1003) { // 账号已解绑，需要刷新左边栏
                clearTimeout(timer);
                noBind()
            }else if(_d.code == 1004) { // 踢下线
                clearTimeout(timer);
                blToast('分身在其他地方登录', 1004)
            }else if(_d.code == 1005) { // 删除分身
                clearTimeout(timer);
                blToast('分身已被删除', 1005)
            }else {
                timer = setTimeout(function () {
                    heartbeat()
                }, 5 * 1000)
            }

        }else {
            timer = setTimeout(function () {
                heartbeat()
            }, 5 * 1000)
        }

    }).catch(function () {
        timer = setTimeout(function () {
            heartbeat()
        }, 5 * 1000)
    })
}

/**
 * 没有关联账号的跳转
 */
export const noBind = () => {
    var cur = store.state.currentPlatform;
    cur.is_relation = false
    store.commit('changePlatform',cur)
    setStore('currPlat',cur)
    window.console.log(cur)
    let m_ls = getStore('media_platform');
    for (let i = 0; i<m_ls.length; i++) {
        if(m_ls[i].platform == cur.platform) {
            m_ls[i].is_relation = false;
            m_ls[i].user = null;
        }
    }
    var userInfo = getStore('userInfo');
    userInfo.bind_account[cur.app_name] = null;
    setStore('userInfo',userInfo)
    setStore('media_platform',m_ls)
    router.push({
        path: '/welcome',
        platform:cur.platform
    })
}

/**
 * 信息提示
 * @param msg
 */
export const blToast = (msg, code) => {
    if(msg == '登录已过期，请您重新登录') {
        blLogout()
    }
    if(code == 1002 || code == 1004 || code == 1005) {
        blLogout()
    }
    Message.info(msg)

}

/**
 * 退出登录
 */
export const blLogout = () => {
    var lc_user = getStore('userInfo');
    setStore('last_user_info',lc_user)
    removeStore('userInfo');
    removeStore('currPlat');
    removeStore('bbs');
    removeStore('no_look');
    removeStore('media_platform');
    var currentPlatform = store.state.currentPlatform;

    setTimeout(function () {
        Watermark.clear()
        currentPlatform.is_relation = false;
        store.commit('changePlatform', currentPlatform)
        store.commit('setUserInfo',null)
        router.push({
            path: '/login'
        })
    },1500)
}

/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}

/**
 * 获取localStorage
 */
export const getStore = name => {
    if (!name) return;
    let store = window.localStorage.getItem(name);
    try {
        store = JSON.parse(store);
    }catch (e) {
        store = window.localStorage.getItem(name)
    }
    return store;
}

/**
 * 删除localStorage
 */
export const removeStore = name => {
    if (!name) return;
    window.localStorage.removeItem(name);
}

/**
 * 页面的跳转
 * @param name
 */
export const pageJump = name => {
    window.console.log(router.history.current.name)
    window.console.log(store.state.currentPlatform)
    var pg_name = router.history.current.name,
        userInfo = getStore('userInfo')
    if(pg_name == 'login') {
        if(userInfo.bind_account && JSON.stringify(userInfo.bind_account) != '{}') {
           var plat =  Object.keys(userInfo.bind_account)[0]
            if(JSON.stringify(userInfo.bind_account[plat]) != '{}') {
                plat.is_relation = true
                setStore('currPlat',plat)
                store.commit('changePlatform', plat)

                router.push({
                    path: '/unfinished',
                    query: {
                        id: plat.platform
                    }
                })
            }else {
                var currentPlatform = store.state.currentPlatform;
                store.commit('changePlatform', currentPlatform)
                router.push({
                    path: '/welcome',
                    query: {
                        id: 'autohome'
                    }
                })
            }

        }else {
            router.push({
                path: '/welcome',
                query: {
                    id: 'autohome'
                }
            })
        }
    }
}

export const toHomepage = () => {
    let currentPlatform = store.state.currentPlatform;
    let homepage = store.state.platform_homepage[currentPlatform.platform];
    window.open(homepage)
}

/**
 * 计算时差
 * @param dateTimeStamp 时间戳
 * @param lv 显示一级还是两级时间
 * @returns {string}
 */
export const getDateDiff = (dateTimeStamp, lv)=> {
    var secend = 1000 ;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    var result;
    if (diffValue < 0) {
        //若日期不符则弹窗口告之,结束日期不能小于开始日期！
    }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    var secC = diffValue / secend;
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    if(lv == 2) {
        if (dayC >= 1) {
            result = "" + parseInt(dayC) + "天";
            if ((parseInt(hourC) % 24) >= 1) {
                result = "" + parseInt(dayC) + "天" + (parseInt(hourC) % 24) + "小时";
            }
        } else if (hourC >= 1) {
            result = "" + parseInt(hourC) + "小时";
            if ((parseInt(minC)) % 60 >= 1) {
                result = parseInt(hourC) + "小时" + (parseInt(minC) % 60) + "分钟";
            }
        } else if (minC >= 1) {
            result = "" + parseInt(minC) + "分钟";
        } else {
            result = parseInt(secC) + '秒';
        }
    }
    return result;
};
