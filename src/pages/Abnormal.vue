<template>
    <div class="abnormal-box">
        <div class="find-box" v-if="showFind">
            <div class="find-body">
                <div class="f-title">智能排查</div>
                <div class="text">需提供执行任务的汽车之家账号地址用于智能排查</div>
                <div class="search-box">
                    <Input search enter-button="开始排查" clearable :placeholder="placeholder" @on-search="search"
                           @search="search" @enter="search" @click="search"/>
                </div>
            </div>
            <div class="find-tips-box">
                <div class="rl-top">
                    关联步骤：
                </div>
                <div class="rl-desc-item">
                    1.点击
                    <Button @click="toUserHome" class="primary-line-btn">去{{curPlat.name}}个人主页</Button>
                    ，若未登录请先登录 “<span class="blue-t"> {{curPlat.name}} </span>” 账号
                </div>
                <div class="rl-desc-item">
                    2.从浏览器地址栏中复制地址粘贴到上方输入框即可，地址类似为：https://i.autohome.com.cn/132132141
                </div>

            </div>
        </div>
        <div class="loading-box" v-show="loading">
            <Loading></Loading>
            <div class="loading-tips">智能排查中</div>
        </div>
        <div class="ab-tips-box animated fadeInUp" v-show="showTips">
            <div class="ab-tips-item error-tip fadeInTop" v-show="!is_check">
                <i class="iconfont iconfs-jingao ab-tips-ico"></i>
                <span>执行任务账号与关联账号不一致</span>
            </div>
            <div class="ab-tips-item succ-tip fadeInTop" v-show="is_check">
                <i class="iconfont iconfs-right ab-tips-ico"></i>
                <span>识别账号与关联账号的一致</span>
            </div>
        </div>

        <!-- 返回结果   -->
        <div class="animated fadeIn" v-show="showResult">
            <div class="ab-result-box ab-result-box1" v-if="abType == 'ab1'">
                <div class="result-item">
                    执行任务的账号“ <span class="blue-t">{{con_name}}</span> ” 已被其它人关联使用，需要您到汽车之家切换到“ <span
                        class="blue-t">{{curPlat.user.name}}</span>
                    ” 账号，再次排查。
                </div>
                <div class="ab-r-hd-btn-box">
                    <Button class="ab-r-hd-btn" size="large" @click="checkAgain" type="primary">切换帐号</Button>
                </div>
            </div>

            <div class="ab-result-box ab-result-box1" v-if="abType == 'ab2'">
                <div class="result-item">
                    执行任务的账号“ <span class="blue-t">{{con_name}}</span> ” 与已关联账号没有任何任务线索，需要您到汽车之家切换到“ <span
                        class="blue-t">{{curPlat.user.name}}</span> ” 再次排查。
                </div>
                <div class="ab-r-hd-btn-box">
                    <Button class="ab-r-hd-btn" size="large" @click="checkAgain" type="primary">切换帐号</Button>
                </div>
            </div>
            <div class="ab-result-box ab-result-box2" v-if="abType == 'ab3'">
                <div class="big-t" style="margin-bottom: 12px">智能排查</div>
                <div class="result-item" style="text-align: left">
                    您已用“ <span class="blue-t">{{con_name}}</span> ” 账号执行了{{errDataCount}}条任务，很可能在汽车之家执行任务时没有切换到“ <span
                        class="blue-t">{{curPlat.user.name}}</span> ” 账号。
                    您是否更改关联账号为“ <span class="blue-t">{{con_name}}</span> ” ？更改后以上已执行任务将完成验收。
                </div>
                <div class="ab-r-hd-btn-box">
                    <Button class="ab-r-hd-btn primary-line-btn" size="large" @click="back" type="default">不更改</Button>
                    <Button class="ab-r-hd-btn" size="large" :loading="changeAccountLoading" @click="changeAccount" type="primary">确定更改</Button>
                </div>
                <div class="task-content">
                    <div class="task-list-top dpflex">“{{con_name}}”已执行任务</div>
                    <div class="bl-task-table">
                        <Table :data="taskTb" :columns="TbColumns">
                            <template slot-scope="{ row }" slot="title">
                                <TaskArticle :item="row.title "></TaskArticle>
                            </template>
                        </Table>
                        <div style="padding: 10px;overflow: hidden;background: #fff">
                            <div style="float: right;">
                                <Page :total="errDataCount" :page-size="limit" :current="1"
                                      @on-change="changePage"></Page>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ab-result-box ab-result-box2" v-if="abType == 'ab4'">
                <div class="big-t" style="margin-bottom: 12px">智能排查</div>
                <div class="result-item">
                    “ <span class="blue-t">{{curPlat.user.name}}</span> ”
                    账号已有{{errDataCount}}条任务未检测到任何评论，很可能已被汽车之家屏蔽！建议更换关联账号，重新执行任务。
                </div>
                <div class="ab-r-hd-btn-box">
                    <Button class="ab-r-hd-btn primary-line-btn" size="large" @click="back" type="default">知道了</Button>
                </div>
                <div class="task-content">
                    <div class="task-list-top dpflex">“{{curPlat.user.name}}”已执行任务</div>
                    <div class="bl-task-table">
                        <Table :data="taskTb" :columns="TbColumns">
                            <template slot-scope="{ row }" slot="title">
                                <TaskArticle :item="row.title "></TaskArticle>
                            </template>
                        </Table>
                        <div style="padding: 10px;overflow: hidden;background: #fff">
                            <div style="float: right;">
                                <Page :total="errDataCount" :page-size="limit" :current="1"
                                      @on-change="changePage"></Page>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import Loading from '../components/Loading'
    import animate from 'animate.css';
    import TaskArticle from '../components/TaskArticle'


    export default {
        name: "abnormal",
        data() {
            return {
                isshow: false,
                showFind: true, // 显示搜索
                curPlat: this.$store.state.currentPlatform,
                abType: '', // 异常类型 ab1 ab2 ab3 ab4
                loading: false,
                showTips: false, // 是否显示账号是否一直的提示，有匹配到任务的不显示
                is_check: true, // err 账号不一致 | succ 账号不一致
                showResult: true, // 显示返回结果
                placeholder: '粘贴汽车之家个人中心网页地址',
                con_name: '',
                errDataCount: 0,

                taskTb: [],
                TbColumns: [
                    {
                        title: '帖子标题',
                        key: 'title',
                        slot: 'title',
                    },
                ],
                limit: 10,
                begin: 0,

                confirm_tickets:[], // 任务线索，排查帐号与绑定帐号不一致且无关联人员时，抓取的可验收数据
                account_data: {}, // 排查帐号信息

                changeAccountLoading: false,

            }
        },
        components: {
            Loading,
            TaskArticle
        },
        methods: {
            // 修改账号
            changeAccount() {
                var _ = this;
                var params = new URLSearchParams();
                params.append('platform', _.curPlat.platform);
                params.append('account_data', JSON.stringify(_.account_data));
                params.append('confirm_tickets', JSON.stringify(_.confirm_tickets));
                _.changeAccountLoading = true;
                API.checkChangeConfirm(params).then(function (res) {
                    _.changeAccountLoading = false;

                    var _d = res.data;
                    if(_d.result) {
                        UTILS.blToast('更改成功')
                        var currPlat = _.$store.state.currentPlatform
                        currPlat.user.name = _.account_data.name
                        currPlat.user.avatar = _.account_data.avatar
                        currPlat.user.user_id = _.account_data.user_id
                        var userInfo = UTILS.getStore('userInfo')
                        userInfo.bind_account[currPlat.platform] = currPlat
                        _.$store.commit('setUserInfo',userInfo)
                        UTILS.setStore('userInfo',userInfo)
                        _.$store.commit('changePlatform',currPlat)
                        UTILS.setStore('currPlat',currPlat)
                        setTimeout(function () {
                            _.$router.replace({
                                path:'/finished',
                                query: {
                                    id:_.curPlat.platform,
                                    tab:'finished'
                                }
                            })
                        },1500)


                    }else {
                        UTILS.blToast(_d.msg)
                    }

                }).catch(function () {
                    _.changeAccountLoading = false;
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
            // 重新排查
            checkAgain() {
                var _ = this;
                _.showFind = true
                _.abType = ''
                _.showTips = false
            },
            // 开始排查
            search(val) {
                var _ = this;
                if (val != '') {
                    _.showFind = false
                    _.loading = true
                    var params = new URLSearchParams();
                    var account_id = _.$route.query.account_id
                    var currPlat = UTILS.getStore('currPlat');
                    var platform = currPlat.platform;
                    params.append('url', val);
                    params.append('platform', platform);
                    params.append('account_id', account_id);
                    API.accountCheck(params).then(function (res) {
                        if (res.data.result) {
                            var _d = res.data;
                            _.is_check = _d.check
                            _.showTips = true;
                            _.account_data = _d.account_data;

                            if (_.is_check) {
                                _.loading = false

                                setTimeout(function () {
                                    _.showTips = false
                                    _.errorTicketsCount(account_id)
                                }, 1000)
                            } else {


                                if (!_.is_check && !_d.has_con) { // 账号不一致，没有被别人关联
                                    if (_d.progress_key) {
                                        _.getProgress(_d.progress_key)
                                    }
                                    _.con_name = _d.account_data.name


                                }
                                if (!_.is_check && _d.has_con) { // 账号不一致，已经被别人关联
                                    _.loading = false

                                    _.con_name = _d.account_data.name
                                    setTimeout(function () {
                                        _.abType = 'ab1'
                                    }, 1000)
                                }
                            }


                        } else {
                            UTILS.blToast(res.data.msg)
                            _.showFind = true
                            _.loading = false
                        }

                    }).catch(function () {
                        UTILS.blToast(_.GLOBAL.sysErrMsg)
                        _.showFind = true
                        _.loading = false
                    })
                } else {
                    UTILS.blToast('个人中心网页地址不能为空')
                }

            },
            getProgress(progress_key) {
                var _ = this;
                var progress_timer;
                clearInterval(progress_timer);
                var params = {
                    progress_key: progress_key
                }
                API.getProgress(params).then(function (res) {
                    window.console.log('progress')
                    var _d = res.data
                    if (_d.result) {
                        if (_d.progress == '100.00%') {
                            _.loading = false
                            window.console.log('progress 100.00%')

                            if (_d.data_result && _d.data_result.length > 0) { // 有任务
                                _.showTips = false
                                _.errDataCount = _d.data_result.length || 0

                                var iss = _d.data_result
                                var _dt = []
                                var confirm_tickets = []
                                for (let i = 0; i < iss.length; i++) {
                                    let dti = iss[i].ticket_data;
                                    let dsc = dti.description
                                    // tag start
                                    let tagName = '';
                                    let tagColor = '';
                                    let hasVideo = false;
                                    let hasImg = false;
                                    if(dsc.article_type) {
                                        // 问题 < 精华 < 精选
                                        if (dsc.article_type.indexOf('qa') > -1) {
                                            tagName = '问题';
                                            tagColor = 'bg-blue'
                                        }
                                        if (dsc.article_type.indexOf('jh') > -1) {
                                            tagName = '精华';
                                            tagColor = 'bg-orange'
                                        }
                                        if (dsc.article_type.indexOf('jx') > -1) {
                                            tagName = '精选';
                                            tagColor = 'bg-blue'
                                        }
                                        if (dsc.article_type.indexOf('video') > -1) {
                                            hasVideo = true
                                        } else if (dsc.article_type.indexOf('img') > -1) {
                                            hasImg = true
                                        }
                                    }
                                    // tag end

                                    var tb_item = {
                                        title: {
                                            task_id: dti.task_id,
                                            title: dti.summary,
                                            url: dsc.article_url,
                                            tag: 'top',
                                            tagName: tagName,
                                            tagColor: tagColor,
                                            hasImg: hasImg,
                                            hasVideo: hasVideo,
                                            author: dti.creator.name,
                                            time: UTILS.getDateDiff(dti.task_create_at * 1000),
                                            error_status: dti.custom_fields_obj.error_status || null,
                                            operate_account: dti.custom_fields_obj.operate_account || null,
                                        },
                                    };
                                    _dt.push(tb_item);
                                    var cf_tk = {
                                        ticket_id: dti.ticket_id,
                                        confirmed_data: iss[i].confirmed_data
                                    }

                                    confirm_tickets.push(cf_tk)
                                }
                                _.confirm_tickets = confirm_tickets;
                                _.taskTb = _dt;

                                _.abType = 'ab3'
                                window.console.log(_d.data_result)

                                var data_result = JSON.parse(_d.data_result)
                                var ticket_data = data_result.ticket_data
                                _.taskTb = ticket_data
                                window.console.log(ticket_data)
                            } else {// 无任务

                                _.abType = 'ab2'
                            }
                        } else {
                            progress_timer = setTimeout(function () {
                                _.getProgress(progress_key)
                            }, 1000)
                        }
                    }

                }).catch(function () {
                })
            },
            errorTicketsCount() {
                var _ = this;
                var currPlat = UTILS.getStore('currPlat');
                var params = {
                    error_status: 'no_action',
                    platform: currPlat.platform,
                    is_count: true,
                }
                API.errorTickets(params).then(function (res) {
                    var _d = res.data
                    if (_d.result) {
                        _.errDataCount = _d.count
                        _.errorTickets()

                    }

                }).catch(function () {
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
            errorTickets() {
                var _ = this;
                var currPlat = UTILS.getStore('currPlat');
                var params = {
                    error_status: 'no_action',
                    platform: currPlat.platform,
                    begin: _.begin * _.limit,
                    limit: _.limit
                }
                API.errorTickets(params).then(function (res) {
                    var _d = res.data
                    if (_d.result) {
                        var iss = _d.issues
                        var _dt = []
                        for (let i = 0; i < iss.length; i++) {
                            let dti = iss[i];
                            let dsc = dti.description
                            let tagName = '';
                            let tagColor = '';
                            let hasVideo = false;
                            let hasImg = false;
                            // tag start
                            if(dsc.article_type) {
                                if (dsc.article_type.indexOf('jh') > -1) {
                                    tagName = '精华'
                                    tagColor = 'bg-orange'
                                } else if (dsc.article_type.indexOf('jx') > -1) {
                                    tagName = '精选'
                                    tagColor = 'bg-blue'
                                } else if (dsc.article_type.indexOf('qa') > -1) {
                                    tagName = '问题'
                                    tagColor = 'bg-blue'
                                } else if (dsc.article_type.indexOf('video') > -1) {
                                    hasVideo = true
                                } else if (dsc.article_type.indexOf('img') > -1) {
                                    hasImg = true
                                }
                            }
                            // tag end

                            var tb_item = {
                                title: {
                                    task_id: dti.task_id,
                                    title: dti.summary,
                                    url: dsc.article_url,
                                    tag: 'top',
                                    tagName: tagName,
                                    tagColor: tagColor,
                                    hasImg: hasImg,
                                    hasVideo: hasVideo,
                                    author: dti.creator.name,
                                    time: UTILS.getDateDiff(dti.task_create_at * 1000),
                                    error_status: dti.custom_fields_obj.error_status || null,
                                    operate_account: dti.custom_fields_obj.operate_account || null,
                                },
                            }
                            _dt.push(tb_item)
                        }
                        _.taskTb = _dt;
                        _.abType = 'ab4'

                    }

                }).catch(function () {
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
            toUserHome() {
                UTILS.toHomepage()
            },
            finding() {
                var _ = this;
                setTimeout(function () {
                    _.showTips = true
                }, 2000)
                setTimeout(function () {
                    _.loading = false
                    var abType = 'ab3';
                    if (abType == 'ab3' || abType == 'ab4') {
                        _.showTips = false
                    }


                }, 4000)
                setTimeout(function () {
                    var abType = 'ab3';
                    _.abType = abType


                }, 4500)
            },
            back() {
                this.$router.go(-1)
            },
            get_copy_text() {

            },
            changePage(num) {
                window.console.log(num)

            },
        },
        mounted() {
            this.get_copy_text();
        },
        created() {
            this.curPlat = this.$store.state.currentPlatform
            window.console.log(this.curPlat)
        }
    }
</script>

<style scoped>
    .abnormal-box {
        background: #fff;
        min-height: 100%;
    }

    /* 搜索 start */
    .find-body {
        background: #ffffff;
        padding: 22px 32px 36px 32px;
        margin-bottom: 20px;
    }

    .f-title {
        font-family: PingFang-SC-Medium;
        font-size: 24px;
        color: #333333;
        letter-spacing: -1.39px;
        text-align: center;
        margin-bottom: 20px;
    }

    .text {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
    }

    .search-box {
        margin-top: 10px;
    }

    .find-tips-box {
        background: #fff;
        height: 485px;
        border-top: 20px solid #F5F6FA;
    }

    .rl-top {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #333333;
        letter-spacing: 0;
        line-height: 36px;
    }

    .rl-desc-item {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #666666;
        letter-spacing: 0;
        line-height: 36px;
        word-break: break-all;
    }

    .rl-eg {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #999999;
        letter-spacing: -0.88px;
        margin: 24px 0 28px;
    }

    .rl-link-box {
        align-items: center;
    }

    .rl-link-l {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        letter-spacing: -0.88px;
        margin-right: 12px;
    }

    .rl-link-r {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        letter-spacing: -0.88px;
        height: 40px;
        flex: 1;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        padding: 0 10px;
    }

    .rl-btn {
        display: block;
        margin: 0 auto 28px;
    }

    .find-tips-box {
        padding: 20px 32px;
    }

    /* 搜索 end */

    .loading-box {
        padding-top: 72px;
    }

    .loading-tips {
        font-family: PingFang-SC-Regular;
        font-size: 20px;
        color: #4A4A4A;
        letter-spacing: -1.16px;
        text-align: center;
    }

    .ab-tips-item {
        height: 68px;
        width: 100%;
        display: flex;
        display: -webkit-flex;
        align-items: center;
        justify-content: center;
        font-family: PingFang-SC-Regular;
        font-size: 20px;
        letter-spacing: -1.16px;
        text-align: center;
    }

    .ab-tips-ico {
        font-size: 24px;
        margin-right: 8px;
    }

    .succ-tip {
        color: #1989FA;
        background-image: linear-gradient(-90deg, #FFFFFF 10%, #EBF1F9 47%, #FFFFFF 87%);
    }

    .error-tip {
        color: #F56C6C;
        background-image: linear-gradient(-90deg, #FFFFFF 10%, #FEF0F0 47%, #FFFFFF 87%);
    }

    .result-item {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #666666;
        letter-spacing: 0;
        line-height: 36px;
        padding: 0 20px;
        word-break: normal;
    }

    .ab-r-hd-btn-box {
        display: flex;
        display: -webkit-flex;
        align-items: center;
        justify-content: center;
        margin: 40px auto;
    }

    .ab-r-hd-btn {
        margin-left: 60px;
    }

    .ab-r-hd-btn:first-of-type {
        margin-left: 0;
    }

    .ab-result-box, .ab-tips-box {
        padding-top: 64px;
    }

    .ab-result-box2 {
        padding-top: 24px;

    }

    /* ---已做任务列表 start--- */
    .task-content {
        border-top: 20px solid #F5F6FA;
    }

    .task-list-top {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #333333;
        text-align: center;
    }

    .task-list-top {
        height: 46px;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #e8eaec;
    }

    /* ---已做任务列表 end--- */


    .show-enter-active, .show-leave-active {
        transition: all .5s;
    }

    .show-enter, .show-leave-to {
        margin-top: 50px;
    }

    .show-enter-to, .show-leave {
        margin-left: 0px;
    }

</style>
