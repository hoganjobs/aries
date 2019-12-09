import Vue from 'vue'
import store from '../store/store'
import router from '../router'
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
 * 信息提示
 * @param msg
 */
export const blToast = (msg) => {
    if(msg == '登录已过期，请您重新登录') {
    // if(msg == '123') {
        var lc_user = getStore('userInfo');
        setStore('last_user_info',lc_user)
        removeStore('userInfo')
        store.commit('setUserInfo',null)
        setTimeout(function () {
            router.push({
                path: '/login'
            })
        },1500)
    }
    Message.info(msg)

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
    store = JSON.parse(store);
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

/**
 * 计算时差
 * @param dateTimeStamp 时间戳
 * @param lv 显示一级还是两级时间
 * @returns {string}
 */
export const getDateDiff = (dateTimeStamp, lv)=> {
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
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "个月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "个小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    if(lv == 2) {
        if (dayC >= 1) {
            result = "" + parseInt(dayC) + "天";
            if (hourC >= 1) {
                result = "" + parseInt(dayC) + "天" + (parseInt(hourC) % 24) + "个小时";
            }
        } else if (hourC >= 1) {
            result = "" + parseInt(hourC) + "个小时";
            if (minC >= 1) {
                result = parseInt(hourC) + "个小时" + (parseInt(minC) % 60) + "分钟";
            }
        } else if (minC >= 1) {
            result = "" + parseInt(minC) + "分钟";
        } else {
            result = "刚刚";
        }
    }
    return result;
}
