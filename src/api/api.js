import {get, post, postJson, deletes, putFormData/*, post, deletes, put*/} from './axios.js' ;//导入axios实例文件中方法


//获取登录二维码
export const getLoginQrcode = (params) => {
    return get('/api/v1/twin/login/qrcode', params);
};

//登录轮询接口
export const getLogin = (params) => {
    return post('/api/v1/twin/login', params);
};

// 获取分身列表 暂时未用
export const getTwinList = (params) => {
    return get('/api/v1/twin/list', params);
};

//获取可抢任务列表
export const getTaskGrab = (params) => {
    return get('/api/v1/twin/tasks/grab', params);
};

//去评论 抢单
export const taskGrad = (params,from) => {
    return post('/api/v1/twin/tasks/grab', params, from);
};
//去评论 改状态为已处理
export const taskResolved = (params, from) => {
    return putFormData('/api/v1/twin/task/resolved', params, from);
};

//关联第三方接口
export const bindOthers = (params) => {
    return post('/api/v1/twin/bind', params);
};


//第三方解绑
export const unbindOthers = (open_type, params) => {
    return deletes('/api/v1/twin/bind?open_type='+open_type, params);
};

//工单列表
export const getTickets = (params) => {
    return get('/api/v1/twin/tickets', params);
};

/**
 *智能排查
 * @param params
 * @returns {AxiosPromise}
 */
export const accountCheck = (params) => {
    return post('/api/v1/twin/account/check', params);
};

/**
 *智能排查任务线索，获取不一致帐号验收数据
 * @param params
 * @returns {AxiosPromise}
 */
export const checkConfirmData = (params) => {
    return post('/api/v1/twin/account/check/confirm/data', params);
};

/**
 *智能排查 获取异常工单列表
 * @param params
 * @returns {AxiosPromise}
 */
export const errorTickets = (params) => {
    return get('/api/v1/twin/error/tickets', params);
};

/**
 *智能排查切换帐号，验收异常工单
 * @param params
 * @returns {AxiosPromise}
 */
export const checkChangeConfirm = (params) => {
    return post('/api/v1/twin/account/check/change/confirm', params);
};


/**
 * 进度
 * @param params
 * @returns {AxiosPromise}
 */
export const getProgress = (params) => {
    return get('/api/v1/twin/progress', params);
};


/**
 * 心跳
 * @param params
 * @returns {AxiosPromise}
 * code 1002 登录过期
 */
export const heartbeat = (params) => {
    return get('/api/v1/twin/heartbeat', params);
};

/**
 * 论坛列表
 * @param params
 * @returns {AxiosPromise}
 */
export const optionsList = (params) => {
    return get('/api/v1/twin/list/options', params);
};

/**
 * 获取要关注的deeplink
 * @param media_platform 平台
 * @param action_type = web
 * @returns {AxiosPromise}
 */
export const getBindAccount = (params) => {
    return get('/api/v1/twin/mobile/bind', params);
};

/**
 * 关联账号
 * @param open_type 平台
 * @param name 平台中的昵称
 * @returns {AxiosPromise}
 */
export const bindAccount = (params) => {
    return post('/api/v1/twin/mobile/bind', params);
};

/**
 * 获取粉丝列表
 * @param open_type 平台
 * @param name 平台中的昵称
 * @returns {AxiosPromise}
 */
export const getFans = (params) => {
    return get('/api/v1/twin/autohome/fans', params);
};

/**
 * 获取粉丝信息
 * @param media_platform 平台
 * @param target_id 
 * @returns {AxiosPromise}
 */
export const getFansInfo = (params) => {
    return get('/api/v1/twin/bind/info', params);
};
