<template>
    <div id="app">
        <div class="login-box" v-if="showLogin">
            <Login></Login>
        </div>
        <div class="main" id="main" v-if="!showLogin">
            <div class="main-inner">
                <div class="sd">
                    <div class="m-hd">
                        <div class="m-hd-in">
                            <div class="header">
                                <div class="avatar"><img :src="userInfo ? (userInfo.twin_avatar || df_avatar) : df_avatar">
                                </div>
                                <div class="info">

                                    <div class="attend_name">{{userInfo ? (userInfo.twin_name || '') : ''}}</div>
                                </div>
                            </div>
                            <div class="name">{{userInfo ? (userInfo.user_name || '') : ''}}</div>
                        </div>

                    </div>
                    <div class="m-lst-box topnav_box">
                        <div class="m-lst">
                            <Menu :active-name="activeName" theme="dark" :key="menuKey" :open-names="[openMenu]">
                                <ChatItem v-for="(item,index) in platformList" :key="index" :item="item" :id="'all1'"
                                          @click.native="tapItem(item,index)" :activeName="activeName"></ChatItem>
                            </Menu>


                        </div>
                    </div>
                </div>
                <div class="chat-box">
                    <div class="chat-area">
                        <div class="box-hd" v-show="currentPlatform.is_relation">
                            <div class="title dpflex">
                                <div class="plat-user-avatar">
                                    <img :src="currentPlatform.user_avatar" alt="">
                                </div>
                                <span>{{currentPlatform.user_name}}</span>
                                <i class="iconfont iconfs-duangkai off-rl-ico" @click="showUnRelation" title="解除关联"></i>
                            </div>
                            <div class="refresh-ico-box back-ico-box" v-show="topShowIco=='back'" @click="pageBack"><i
                                    class="iconfont iconfs-back refresh-ico"></i></div>
                            <div @click="refresh" ref="refresh" id="refresh" class="refresh-ico-box" v-show="topShowIco=='refresh'"><i
                                    class="iconfont iconfs-shuaxin refresh-ico"></i></div>
                        </div>
                        <div class="chat-bd topnav_box"><!---->
                            <!--  页面区域            -->
                            <router-view/>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal v-model="offRlModal" title=" " width="640px">
            <div>
                <div class="md-title">解除关联</div>
                <div class="rl-body">
                    <div class="off-rl-tips dpflex">
                        你确定要解除与汽车之家账号“
                        <div class="off-rl-user-box dpflex">
                            <div class="plat-user-avatar">
                                <img :src="currentPlatform.user_avatar" alt="">
                            </div>
                            <span>{{currentPlatform.user_name}}</span>
                        </div>
                        ” 关联？
                    </div>
                </div>
            </div>
            <div slot="footer">
                <div class="off-rl-footer-box">
                    <Button class="rl-btn primary-line-btn" size="large" @click="hideUnRelation">不解除</Button>
                    <Button class="rl-btn" size="large" :loading="unbindLoading" type="primary" @click="unbind">解除绑定</Button>
                </div>
            </div>
        </Modal>

    </div>
</template>

<script>
    import * as API from './api/api';
    import * as UTILS from './api/utils';
    import Watermark from './api/watermark'
    import ChatItem from './components/ChatItem'
    import Login from './pages/Login'

    export default {
        name: 'App',
        components: {
            ChatItem,
            Login,
        },
        data() {
            return {
                menuKey: '', // 左边栏key 触发更新
                showLogin: false,
                df_avatar: require('./static/img/df_avatar_new.jpg'),
                currPage: '',
                currentPlatform: {},
                platformList: [],
                userInfo: {},
                activeName: '',
                openMenu: '',
                offRlModal: false, // 是否显示取消关联modal
                topShowIco: 'refresh', // 头部显示图标 refresh 刷新 | back 返回

                unbindLoading: false,
            }
        },
        methods: {
            checkDom:function(){

            },


            // 解除绑定
            unbind() {
                var _ = this;
                window.console.log('解除绑定')
                window.console.log(_.currentPlatform)
                _.unbindLoading = true
                var platform = _.currentPlatform.platform
                API.unbindOthers(platform).then(function (res) {
                    _.unbindLoading = false
                    _.offRlModal = false
                    if(res.data.result) {
                        UTILS.blToast('解除成功')
                        var cur = _.currentPlatform;
                        cur.is_relation = false
                        _.$store.commit('changePlatform',cur)
                        window.console.log(cur)
                        window.console.log(_.currentPlatform)

                        var userInfo = UTILS.getStore('userInfo');
                        userInfo.bind_account = {}
                        UTILS.setStore('userInfo',userInfo)
                        _.platformList = _.platformList
                        _.$router.push({
                            path: '/welcome',
                        })
                    }else {
                        UTILS.blToast(res.data.msg)
                    }

                }).catch(function () {
                    _.unbindLoading = false
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })

            },
            // 返回上一页
            pageBack() {
                this.$router.go(-1);
            },
            // 是否显示返回按钮
            ckTopShowIco() {
                var path = this.$route.path
                if (path == '/find' || path == '/abnormal') {
                    this.topShowIco = 'back'
                } else {
                    this.topShowIco = 'refresh'
                }
            },
            hideUnRelation() {
                this.offRlModal = false
            },
            showUnRelation() {
                this.offRlModal = true
            },
            tapItem(item, index) {
                this.$store.commit('changePlatform', this.platformList[index])
                this.currentPlatform = this.$store.state.currentPlatform;
                if (this.$route.path == '/welcome' && this.$route.query.platform == item.id) {

                } else {
                    this.activeName = item.id
                    this.$router.replace({
                        path: '/welcome',
                        query: {
                            platform: item.id
                        }
                    })
                }
            },
            refresh() {
                var refresh = 'refresh' +  (new Date()).valueOf()
                window.console.log(refresh)
                this.$store.commit('clickRefresh', refresh)
            },

        },
        mounted() {
            this.checkDom()
            if (this.$route.path == '/') { // 没有路由时
                if (this.$store.state.userInfo) {
                    this.$router.replace({
                        path: '/unfinished'
                    })

                } else {
                    this.$router.replace({
                        path: '/login'
                    })
                }
            }
            if (this.$route.path == '/login') { // todo 登录页有user信息时的跳转
                if (this.$store.state.userInfo) {
                    this.$router.replace({
                        path: '/unfinished'
                    })
                }
            }else {
                UTILS.heartbeat()
            }


        },

        created() {
            var _ = this;
            this.currPage = this.$store.state.currentPage
            this.currentPlatform = this.$store.state.currentPlatform
            this.ckTopShowIco()
            window.console.log(this.currentPlatform)
            var userInfo = UTILS.getStore('userInfo')
            this.platformList = this.$store.state.platformList
            // this.platformList = userInfo.media_platform


            if(this.$route.path == '/login') {
                this.showLogin = true
            }

            if(userInfo) {
                this.$store.commit('setUserInfo',userInfo)
                this.userInfo = this.$store.state.userInfo
                window.console.log(this.userInfo)
                var twin = this.userInfo
                // window.location.reload()
                var bind = twin.bind_account;
                window.console.log('bind_account')
                window.console.log(twin)
                window.console.log(bind)
                var _pl = 'autohome'; // 当前平台
                var curr =  bind[_pl];
                if(curr && JSON.stringify(curr) != '{}') {
                    Watermark.set(twin.user_name)

                    window.console.log(curr)
                    var currPlat = _.$store.state.currentPlatform
                    currPlat.is_relation = true;
                    currPlat.platform = _pl;
                    currPlat.user_name = curr.user_name || curr.name;
                    currPlat.user_id = curr.user_id;
                    currPlat.user_avatar = curr.user_avatar || curr.avatar;
                    this.$store.commit('changePlatform',currPlat);
                    UTILS.setStore('currPlat',currPlat)
                    twin.bind_account[_pl] = currPlat
                    _.$store.commit('setUserInfo', twin)
                    UTILS.setStore('userInfo',twin);

                    // 选中左边菜单
                    let path_name = this.$route.name;
                    this.activeName = curr.platform + '-' + path_name
                    this.openMenu = curr.platform
                    if (this.$route.path == '/welcome') { // 没有路由时
                        this.$router.push({
                            path: '/unfinished',
                            query: {
                                id: curr.platform
                            }
                        })
                    }
                }else {
                    if (this.$route.path != '/welcome') { // 没有路由时
                        this.$router.push({
                            path: '/welcome'
                        })
                    }
                }



            }else {
                this.$store.commit('setUserInfo',null)
                if (this.$route.path != '/login') { // 没有路由时
                    this.$router.replace({
                        path: '/login'
                    })
                }

            }
        },
        watch: {
            changePlatform() {
                return this.$store.state.currentPlatform
            },
            $route: { // 监听路由变化
                handler: function (val, oldVal) {
                    window.console.log('path----')
                    window.console.log(this.$store.state.currentPlatform)
                    if(this.$route.path == '/login') {
                        this.showLogin = true
                    }else {
                        this.showLogin = false
                    }
                    // var userInfo = UTILS.getStore('userInfo');
                    // var currPlat = UTILS.getStore('currPlat');
                    // this.userInfo = userInfo
                    // this.$store.commit('changePlatform',currPlat)
                    // this.platformList = []
                    // this.platformList = userInfo.media_platform
                    this.platformList = []
                    this.platformList = this.$store.state.platformList
                    this.currentPlatform = this.$store.state.currentPlatform
                    this.menuKey = (new Date()).valueOf();
                    this.userInfo = this.$store.state.userInfo
                    // 选中左边菜单
                    let path_name = this.$route.name;
                    if(path_name == 'abnormal') {
                        path_name = 'finished'
                    }
                    this.activeName = this.currentPlatform.platform + '-' + path_name
                    this.openMenu = this.currentPlatform.platform
                    window.console.log(this.showLogin)
                    this.ckTopShowIco()
                },
                // 深度观察监听
                deep: true
            }
        },
        computed: {
            changePlatform() {

                window.console.log('changePlatform**********************************')
                window.console.log(this.$store.state.currentPlatform)
                this.platformList = this.$store.state.platformList
                this.currentPlatform = this.$store.state.currentPlatform
                this.userInfo = this.$store.state.userInfo
                window.console.log(this.currentPlatform)

            }
        },
    }
</script>
<style lang="less" scoped>
    @import "./static/css/app";
    @import "./static/css/chat_area";
</style>

<style scoped>
    #app {
        background: #CBD6E1;
        width: 100vw;
        height: 100vh;
        background: url('./static/img/bg.jpg') 0px 0px no-repeat;
        background-size: 100% 100%;
    }

    .off-rl-ico {
        font-size: 26px;
        margin-left: 10px;
        cursor: pointer;
        color: #B4BCCC;
    }

    .off-rl-tips {
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
    }

    .off-rl-user-box {
        align-items: center;
        padding: 0 8px;
    }

    .off-rl-user-box .plat-user-avatar img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 7px;
    }

    .off-rl-footer-box {
        padding-bottom: 35px;
    }

    .refresh-ico-box {
        position: absolute;
        right: 20px;
        background: transparent;
    }

    .back-ico-box {
        left: 20px;
        right: auto;
    }

    .refresh-ico {
        font-size: 28px;
        color: #B4BCCC;
        cursor: pointer;
    }
</style>
