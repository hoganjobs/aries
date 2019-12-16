<template>
    <div>
        <div v-if="!is_relation" class="chat-item dpflex" :class="isCurrent ? 'current' : ''">
            <div class="name">{{item.name}}</div>
            <div class='c-right'>
                <i class="iconfont iconfs-lianjie t-ico" @click="showRelation"></i>
            </div>
        </div>

        <Submenu :name="item.platform" v-if="is_relation">
            <template slot="title">
                {{item.name}}
            </template>
            <MenuItem :name="item.platform+'-unfinished'" @click.native="toTask(item,'unfinished')">待做任务</MenuItem>
            <MenuItem :name="item.platform+'-finished'" @click.native="toTask(item,'finished')">已做任务</MenuItem>
        </Submenu>
        <Modal class="bl-rl-md" v-model="rlModal" :title="rlModalTitle" width="640px">
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
                        <!--            <input class="rl-link-r"  >-->
                        <Input :class="'rl-link-r no-submit-btn'" v-model="linkValue" placeholder="" clearable/>

                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button class="rl-btn" size="large" type="primary" :loading="bindLoading" @click="bind">关联帐号</Button>
            </div>
        </Modal>
    </div>

</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import bus from  '../api/bus'
    import merge from 'webpack-merge'
    import {Menu, Submenu, MenuItem} from 'view-design'

    export default {
        name: 'ChatItem',
        components: {
            [Menu.name]: Menu,
            [Submenu.name]: Submenu,
            [MenuItem.name]: MenuItem,
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
                df_avatar: require('../static/img/default_hd.jpg'),
                info: {},
                rlModal: false,
                rlModalTitle: ' ',
                is_relation: false,
                bindLoading: false, // 关联loading
            }
        },
        methods: {
            // 绑定第三方账号
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
                this.rlModal = true
            },
            get_info() {
                window.console.log('render menu')
                this.info = this.$store.state.currentPlatform

                if(this.item.is_relation ) {
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

                if(_.$route.name != page) {
                    this.$router.push({
                        path: '/'+page,
                        query: {
                            id: this.item.platform
                        }
                    })
                }else {
                    this.$router.replace({
                        query: merge(this.$route.query,{'id':this.item.platform})
                    })
                    bus.$emit(page+'Refresh',refresh)
                }


            }
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

    .rl-btn {
        display: block;
        margin: 0 auto 28px;
    }
</style>
