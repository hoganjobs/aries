<template>
    <div>
        <div v-if="!is_relation" class="chat-item dpflex" :class="isCurrent ? 'current' : ''">
            <div class="name">{{item.name}}</div>
            <div class='c-right'>
                <i class="iconfont iconfs-connect t-ico" @click="showRelation"></i>
            </div>
        </div>

        <Submenu :name="item.platform" v-if="is_relation">
            <template slot="title">
                {{item.name}}
            </template>
            <MenuItem :name="item.platform+'-unfinished'" @click.native="toTask(item,'unfinished')">待做任务</MenuItem>
            <MenuItem :name="item.platform+'-finished'" @click.native="toTask(item,'finished')">已做任务</MenuItem>
        </Submenu>
<!--         <Modal class="bl-rl-md" v-model="rlModal" :title="rlModalTitle" width="640px">
            <div>
                <div class="md-title">关联{{item.name}}账号</div>
                <div class="rl-body">
                    <div class="rl-top">
                        关联步骤：
                    </div>
                    <div class="rl-desc-item">
                        1.点击
                        <Button @click="toUserHome" class="primary-line-btn">去{{item.name}}个人主页</Button>
                        ，若未登录请先登录账号
                    </div>
                    <div class="rl-desc-item">
                        2.从浏览器地址栏中复制地址粘贴到下方，点击“关联帐号”即可。
                    </div>
                    <div class="rl-eg">链接地址类似：https://i.autohome.com.cn/132132141</div>
                    <div class="rl-link-box dpflex">
                        <div class="rl-link-l">链接</div>
                        <Input :class="'rl-link-r no-submit-btn'" v-model="linkValue" placeholder="" clearable/>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button class="rl-btn middle" size="large" type="primary" :loading="bindLoading" @click="bind">关联帐号</Button>
            </div>
        </Modal> -->
        <ModalUrlBind :syncModalClose.sync="rlModal" :item="item"></ModalUrlBind>
        <ModalActBind :syncModalClose.sync="rlModalB" :item="item"></ModalActBind>
    </div>

</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import bus from  '../api/bus'
    import merge from 'webpack-merge'
    import {Menu, Submenu, MenuItem} from 'view-design'
    import ModalUrlBind from "./ModalUrlBind";
    import ModalActBind from "./ModalActBind";

    export default {
        name: 'ChatItem',
        components: {
            [Menu.name]: Menu,
            [Submenu.name]: Submenu,
            [MenuItem.name]: MenuItem,
            ModalUrlBind,
            ModalActBind
        },
        props: {
            id: String,
            item: Object,
            activeName: String
        },
        data() {
            return {
                menuActive: '',
                linkValue: '',
                jumpLink: '',
                timerFans: null,
                targetId: null,
                hasResult: false,
                modalStatus: 'start', // start | scan | restart | result
                fansList: [],
                curFansItem: {},
                df_avatar: require('../static/img/default_hd.jpg'),
                info: {},
                rlModal: false,
                rlModalB: false,
                rlModalTitle: ' ',
                rlModalTitleB: ' ',
                is_relation: false,
                bindLoading: false, // 关联loading
                actText: {
                    weibo: "评论",
                    qq: "评论",
                    net_ease: "关注",
                    tieba: "关注",
                    sina: "评论",
                    guba: "关注",
                    xueqiu: "关注"
                }
            }
        },
        methods: {
            // 关联第三方账号
            bind() {
                var _ = this;
                var val = _.linkValue;
                if (val == '') {
                    _.$Message.info('链接不能为空')
                } else {
                    _.bindLoading = true;
                    var currPlat = _.$store.state.currentPlatform;
                    var open_type = currPlat.platform;
                    var params = new URLSearchParams()
                    params.append('open_type', open_type);
                    params.append('bind_url', val);
                    API.bindOthers(params).then(function (res) {
                        _.bindLoading = false;
                        _.rlModal = false;

                        var _d = res.data
                        if (_d.result) {
                            UTILS.blToast('关联成功');
                            let oauth_user_info = {
                                name:_d.oauth_user_info.name,
                                avatar:_d.oauth_user_info.avatar,
                                user_id:_d.oauth_user_info.user_id,
                            }
                            currPlat.user = oauth_user_info
                            currPlat.is_relation = true;
                            let m_ls = UTILS.getStore('media_platform');
                            for (let i = 0; i<m_ls.length; i++) {
                                if(m_ls[i].platform == open_type) {
                                    m_ls[i].is_relation = true;
                                    m_ls[i].user = oauth_user_info;
                                }
                            }
                            let user = UTILS.getStore('userInfo');
                            user.bind_account[open_type] = oauth_user_info
                            UTILS.setStore('media_platform', m_ls)
                            UTILS.setStore('userInfo', user)
                            UTILS.setStore('currPlat', currPlat)
                            _.$store.commit('changePlatform', currPlat)
                            _.$router.push({
                                path: '/unfinished',
                                query: {
                                    id: open_type
                                }
                            })
                            bus.$emit('unfinishedMenuClick','unfinishedMenuClick')

                        } else {
                            UTILS.blToast(_d.msg);

                        }

                    }).catch(function () {
                        _.bindLoading = false;
                        UTILS.blToast(_.GLOBAL.sysErrMsg);

                    })
                }

            },
            toUserHome() {
                UTILS.toHomepage()
            },
            showRelation() {
                console.log("####")
                if (this.item.platform == "autohome" || this.item.platform == "weibo") {
                    this.rlModal = true;
                } else {
                    this.rlModalB = true;
                }
            },
            get_info() {
                window.console.log('render menu')
                this.info = this.$store.state.currentPlatform
                if(this.item.is_relation) {
                    this.is_relation = true
                    if (this.item.platform == this.info.platform && this.info.is_relation) {
                        let path = this.$route.name;
                        let plat = this.$route.query.id;
                        if (plat == this.info.platform) {
                            this.menuActive = plat + '-' + path
                        }
                    }
                }else {
                    this.is_relation = false
                }
            },
            toTask(item, type) {
                window.console.log('toTask toTask toTask')
                window.console.log(item)
                this.toTaskList(item, type)
            },
            toFinished(item) {
                this.toTaskList(item,'finished')
            },
            toTaskList(item,page) {
                var refresh = 'refresh' +  (new Date()).valueOf()
                var _ = this;
                this.$store.commit('changePlatform', item)
                UTILS.setStore('currPlat', item)
                this.$emit('clickTaskMenu', 'change')
                bus.$emit(page+'MenuClick',refresh)
                console.log("@@:", _.$route.name, page);
                if(_.$route.name != page) {
                    this.$router.push({
                        path: '/'+page,
                        query: {
                            id: this.item.platform
                        }
                    })
                } else {
                    if (this.$route.query.id !== this.item.platform) {
                        this.$router.replace({
                            query: merge(this.$route.query,{'id':this.item.platform})
                        })
                    }
                    bus.$emit(page+'Refresh',refresh);
                }
            },
            fItemClick(itemf) {
                this.curFansItem = itemf;
            },
            resetBind() {
                this.modalStatus = 'scan';
                this.getBindAccountLink('reset');
            },
            confirmBind() {
                var _ = this;
                var params = new URLSearchParams()
                let info = _.curFansItem
                window.console.log(info)
                info = JSON.stringify(info)
                if(info == '{}') {
                    UTILS.blToast('请选择要关联的账号')
                }else {
                    // var currPlat = UTILS.getStore('currPlat');
                    var currPlat = _.$store.state.currentPlatform;
                    var open_type = currPlat.app_name;
                    params.append('open_type', open_type);
                    params.append('oauth_user_info',info );
                    API.bindAccount(params).then(function (res) {
                        var _d = res.data
                        if (_d.result) {
                            UTILS.blToast('关联成功');
                            let oauth_user_info = {
                                name:_d.oauth_user_info.name,
                                avatar:_d.oauth_user_info.avatar,
                                user_id:_d.oauth_user_info.user_id,
                            }
                            currPlat.user = oauth_user_info
                            currPlat.is_relation = true;
                            let m_ls = UTILS.getStore('media_platform');
                            for (let i = 0; i<m_ls.length; i++) {
                                if(m_ls[i].platform == open_type) {
                                    m_ls[i].is_relation = true;
                                    m_ls[i].user = oauth_user_info;
                                }
                            }
                            let user = UTILS.getStore('userInfo');
                            user.bind_account[open_type] = oauth_user_info
                            UTILS.setStore('media_platform', m_ls)
                            UTILS.setStore('userInfo', user)
                            UTILS.setStore('currPlat', currPlat)
                            _.$store.commit('changePlatform', currPlat)
                            _.$router.push({
                                path: '/unfinished',
                                query: {
                                    id: open_type
                                }
                            })
                            bus.$emit('unfinishedMenuClick','unfinishedMenuClick')
                        } else {
                            UTILS.blToast(_d.msg);
                        }
                    }).catch(function () {
                        UTILS.blToast(_.GLOBAL.sysErrMsg)
                    })
                }
            },
            cancelScan() {
                this.modalStatus = 'start';
            },
            toJump() {
                let _ = this;
                if (this.jumpLink) {
                    _.modalStatus = 'scan';
                    window.open(this.jumpLink);
                    let duration = 30 * 1000;
                    clearTimeout(_.timerFans);
                    _.timerFans = setTimeout(function () {
                        _.getFans();
                    }, duration);
                }
            },
            getBindAccountLink(reset) {
                var _ = this;
                var params = {
                    media_platform : this.item.platform,
                    action_type: "web"
                }
                API.getBindAccount(params).then(function (res) {
                    if(res.data.result) {
                        _.targetId = res.data.target_id;
                        _.jumpLink = res.data.url;
                        if(reset) {
                            _.toJump()
                        }
                    }
                }).catch(function () {
                    UTILS.blToast(_.GLOBAL.sysErrMsg);
                })
            },
            getFans() {
                var _ = this;
                var params = {
                    target_id: this.targetId,
                    media_platform : this.item.platform
                }
                API.getFans(params).then(function (res) {
                    if(res.data.result) {
                        let fans_list = res.data.fans_list
                        if(fans_list.length) {
                            _.modalStatus = 'result';
                            _.fansList = fans_list;
                            _.curFansItem = fans_list[0];
                        } else {
                            _.modalStatus = 'restart';
                        }
                    }
                }).catch(function () {
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
        },
        watch: {
            activeName(val) {
            }
        },
        computed: {
            // 是否当前
            isCurrent() {
                return this.$store.state.currentPlatform.platform == this.item.platform;
            },
            // 是否显示消息小红点
            isHasNewMsg() {
                return this.$store.state.noRead.includes(String(this.id));
            }
        },
        created() {
            this.get_info()
        }
    }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
    .text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        font-weight: 400;
        font-size: 13px;
        color: #fff;
        line-height: 20px;
    }

    .current {
        background-color: #3a3f45;
    }

    .chat-item {
        display: flex;
        padding: 0 18px 0 40px;
        cursor: pointer;
        justify-content: space-between;
        border-bottom: 1px solid #252A2E;
        height: 48px;
        align-items: center;

        .avatar {
            width: 50px;

            img {
                width: 40px;
                height: 40px;
                border-radius: 3px;
            }
        }

        .new-msg {
            position: relative;

            &:after {
                content: '';
                border: 5px solid red;
                position: absolute;
                top: -5px;
                right: 5px;
                border-radius: 50%;
            }
        }

        .name {
            font-family: PingFang-SC-Regular;
            font-size: 16px;
            line-height: 1;
            color: #FFFFFF;
            &:extend(.text);
        }

        .c-right {
            opacity: 0.5;
            font-family: PingFang-SC-Regular;
            font-size: 14px;
            color: #FFFFFF;
            text-align: center;
        }

        .t-ico {
            font-size: 24px;
        }
    }

    .rl-body {
        width: 480px;
        margin: 0 auto;
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
        color: #2A2A2A;
        letter-spacing: 0;
        line-height: 36px;
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
        border-radius: 4px;
    }

    .rl-link-r input {
        height: 40px;
    }

    .rl-btn.middle {
        display: block;
        margin: 0 auto 28px;
    }
    .rl-header {
        padding-top: 10px;
        font-size: 18px;
        color: #333333;
    }
    .rl-footer {
        text-align: right;
    }
    .loading-tips {
        font-family: PingFang-SC-Regular;
        font-size: 18px;
        color: #4A4A4A;
        letter-spacing: -2.08px;
        text-align: center;
    }
    .restart-tips {
        font-family: PingFang-SC-Regular;
        font-size: 18px;
        color: #F86900;
        letter-spacing: -2.08px;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 20px;
    }
    .ivu-tag-size-large {
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
        margin-right: 13px;
    }
    .ivu-btn.ivu-btn-default.rl-btn {
        color: #333;
        border-color: #dcdfe6;
    }
    .rl-tag {
        display: inline-block;
        height: 32px;
        padding: 0 12px;
        margin: 0 13px 10px 0;
        box-sizing: border-box;
        border-radius: 3px;
        border: 1px solid #e8eaec;
        background: #f7f7f7;
        font-size: 12px;
        line-height: 32px;
        vertical-align: middle;
        opacity: 1;
        overflow: hidden;
        cursor: pointer;
    }
    .rl-tag.active {
        color: #2d8cf0;
        border: 1px solid #2d8cf0;
        background-color: #fff;
    }
    .rl-restart {
        text-align: center;
    }
</style>
