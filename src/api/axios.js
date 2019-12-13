import axios from 'axios';

// 创建axios实例
const service = axios.create({
    timeout: 100000 // 请求超时时间
});

// 添加request拦截器
service.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
});

// 添加response拦截器
service.interceptors.response.use(
    response => {
        let res = {};
        res.status = response.status;
        res.data = response.data;
        return res;
    },
    error => {
        // TODO 可对特殊错误码进行处理
        if (error.response && error.response.status === 404) {
            //
        }

        return Promise.reject(error.response)
    }
);

export function get(url, params = {}) {
    params.t = new Date().getTime(); //get方法加一个时间参数,解决ie下可能缓存问题.
    return service({
        url: url,
        method: 'get',
        headers: {},
        params
    })
}

//封装post请求
export function post(url, data = {}, from) {
    //默认配置
    let sendObject = {
        url: url,
        method: 'post',
        dataType: "json",
        async: false,
        headers: {
            // 'Content-Type': 'application/json;charset=UTF-8'
            'Content-type': 'application/x-www-form-urlencoded',
            'from':from
        },
        data: data
    };
    // sendObject.data = JSON.stringify(data);
    return service(sendObject)
}

//封装post json请求
export function postJson(url, data = {}) {
    //默认配置
    let sendObject = {
        url: url,
        method: 'post',
        contentType: "application/json",
        dataType: "json",
        async: false,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
            // 'Content-type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
    // sendObject.data = JSON.stringify(data);
    return service(sendObject)
}

//封装put方法 (resfulAPI常用)
export function put(url, data = {}) {
    return service({
        url: url,
        method: 'put',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        data: JSON.stringify(data)
    })
}

//封装put方法 (resfulAPI常用)
export function putFormData(url, data = {}, from) {
    return service({
        url: url,
        method: 'put',
        processData: false,
        contentType: false,
        headers: {
            // 'Content-Type': 'application/json;charset=UTF-8'
            'Content-type': 'application/x-www-form-urlencoded',
            'from':from

        },
        data: data
    })
}

//删除方法(resfulAPI常用)
export function deletes(url) {
    return service({
        url: url,
        method: 'delete',
        headers: {}
    })
}

//不要忘记export
export {
    service
}
