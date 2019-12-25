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
                                <div class="avatar">
                                    <img
                                        :src="
                                            userInfo
                                                ? userInfo.twin_avatar ||
                                                  df_avatar
                                                : df_avatar
                                        "
                                    />
                                </div>
                                <div class="info">
                                    <div class="attend_name">
                                        {{
                                            userInfo
                                                ? userInfo.twin_name || ""
                                                : ""
                                        }}
                                    </div>
                                </div>
                            </div>
                            <div class="name">
                                {{ userInfo ? userInfo.user_name || "" : "" }}
                            </div>
                        </div>
                    </div>
                    <div class="m-lst-box topnav_box">
                        <div class="m-lst">
                            <Menu
                                :active-name="activeName"
                                theme="dark"
                                :key="menuKey"
                                :open-names="[openMenu]"
                            >
                                <ChatItem
                                    @clickTaskMenu="clickTaskMenu"
                                    v-for="(item, index) in platformList"
                                    :key="index"
                                    :item="item"
                                    :id="'all1'"
                                    @click.native="tapItem(item, index)"
                                    :activeName="activeName"
                                ></ChatItem>
                            </Menu>
                        </div>
                    </div>
                </div>
                <div class="chat-box">
                    <div class="chat-area">
                        <div
                            class="box-hd"
                            v-show="currentPlatform.is_relation"
                        >
                            <SelectBbs v-if="showBbsList"></SelectBbs>

                            <div class="title dpflex">
                                <div class="plat-user-avatar">
                                    <img
                                        :src="
                                            currentPlatform.user
                                                ? currentPlatform.user.avatar
                                                : df_avatar
                                        "
                                        alt=""
                                    />
                                </div>
                                <span>{{
                                    currentPlatform.user
                                        ? currentPlatform.user.name
                                        : ""
                                }}</span>
                                <i
                                    class="iconfont iconfs-disconnect off-rl-ico"
                                    @click="showUnRelation"
                                    title="解除关联"
                                ></i>
                            </div>
                            <div
                                class="refresh-ico-box back-ico-box"
                                v-show="topShowIco == 'back'"
                                @click="pageBack"
                            >
                                <i class="iconfont iconfs-back refresh-ico"></i>
                            </div>
                            <div
                                @click="refreshData"
                                ref="refresh"
                                id="refresh"
                                class="refresh-ico-box"
                                v-show="topShowIco == 'refresh'"
                            >
                                <i
                                    class="iconfont iconfs-shuaxin refresh-ico"
                                ></i>
                            </div>
                        </div>
                        <div class="chat-bd topnav_box">
                            <!---->
                            <!--  页面区域            -->
                            <router-view />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal class="bl-rl-md" v-model="offRlModal" title=" " width="640px">
            <div>
                <div class="md-title">解除关联</div>
                <div class="rl-body">
                    <div class="off-rl-tips dpflex">
                        你确定要解除与{{ currentPlatform.name }}账号“
                        <div class="off-rl-user-box dpflex">
                            <div class="plat-user-avatar">
                                <img
                                    :src="
                                        currentPlatform.user
                                            ? currentPlatform.user.avatar
                                            : ''
                                    "
                                    alt=""
                                />
                            </div>
                            <span>{{
                                currentPlatform.user
                                    ? currentPlatform.user.name
                                    : ""
                            }}</span>
                        </div>
                        ” 关联？
                    </div>
                </div>
            </div>
            <div slot="footer">
                <div class="off-rl-footer-box">
                    <Button
                        class="rl-btn primary-line-btn"
                        size="large"
                        :loading="unbindLoading"
                        @click="unbind"
                        >解除关联</Button
                    >

                    <Button
                        class="rl-btn "
                        type="primary"
                        size="large"
                        @click="hideUnRelation"
                        >不解除</Button
                    >
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
import * as API from "./api/api";
import * as UTILS from "./api/utils";
import bus from "./api/bus";
import Watermark from "./api/watermark";
import ChatItem from "./components/ChatItem";
import SelectBbs from "./components/SelectBbs";
import Login from "./pages/Login";

export default {
    name: "App",
    components: {
        ChatItem,
        Login,
        SelectBbs
    },
    data() {
        return {
            menuKey: "", // 左边栏key 触发更新
            showLogin: false,
            df_avatar: require("./static/img/df_avatar_new.jpg"),
            currentPlatform: UTILS.getStore("currPlat") || {},
            platformList: UTILS.getStore("media_platform") || [],
            userInfo: {},
            activeName: "",
            openMenu: "",
            offRlModal: false, // 是否显示取消关联modal
            topShowIco: "refresh", // 头部显示图标 refresh 刷新 | back 返回
            unbindLoading: false,
            checkBbsMd: false,
            showBbsList: false // 显示论坛过滤按钮
        };
    },
    methods: {
        // 点击任务列表左边栏
        clickTaskMenu: function() {
            // window.console.log("点击任务列表左边栏");
            // 选中左边菜单
            let path_name = this.$route.name;
            let plat = this.$route.query.id;
            this.activeName = plat + "-" + path_name;
            this.openMenu = plat;
        },

        // 解除关联
        unbind() {
            var _ = this;
            // window.console.log("解除关联 ", _.currentPlatform);
            _.unbindLoading = true;
            // var platform = _.currentPlatform.platform
            var app_name = _.currentPlatform.app_name;
            API.unbindOthers(app_name)
                .then(function(res) {
                    _.unbindLoading = false;
                    _.offRlModal = false;
                    if (res.data.result) {
                        UTILS.blToast("解除成功");
                        UTILS.noBind();
                    } else {
                        UTILS.blToast(res.data.msg);
                    }
                })
                .catch(function() {
                    _.unbindLoading = false;
                    UTILS.blToast(_.GLOBAL.sysErrMsg);
                });
        },
        // 返回上一页
        pageBack() {
            this.$router.go(-1);
        },
        // 是否显示返回按钮
        ckTopShowIco() {
            var path = this.$route.path;
            if (path == "/find" || path == "/abnormal") {
                this.topShowIco = "back";
            } else {
                this.topShowIco = "refresh";
            }
        },
        hideUnRelation() {
            this.offRlModal = false;
        },
        showUnRelation() {
            this.offRlModal = true;
        },
        tapItem(item, index) {
            this.$store.commit("changePlatform", this.platformList[index]);
            this.currentPlatform = this.$store.state.currentPlatform;
            if (
                this.$route.path == "/welcome" &&
                this.$route.query.platform == item.id
            ) {
            } else {
                this.activeName = item.id;
                this.$router.replace({
                    path: "/welcome",
                    query: {
                        platform: item.id
                    }
                });
            }
        },
        refreshData() {
            var refresh = "refresh" + new Date().valueOf();
            // window.console.log("clickRefresh ", refresh);
            // this.$store.commit('clickRefresh', refresh)
            var router_name = this.$route.name;
            bus.$emit(router_name + "Refresh", refresh);
        }
    },
    mounted() {
        var _ = this;
        var userInfo = UTILS.getStore('userInfo')
        if(this.$route.path == '/login') {
            this.showLogin = true
        }
        if(userInfo) {
            if (this.$route.path == '/') { // 没有路由时
                this.$router.replace({
                    path: '/login'
                })
            }else {
                _.$store.commit('setUserInfo', userInfo)
                Watermark.set(userInfo.user_name)

                var currPlat= UTILS.getStore('currPlat')
                if (currPlat) {
                    this.currentPlatform = currPlat
                    this.$store.commit('changePlatform', currPlat)
                    // 选中左边菜单
                    let path_name = this.$route.name;
                    this.activeName = currPlat.platform + '-' + path_name
                    this.openMenu = currPlat.platform
                    if(currPlat.platform == 'autohome') {
                        this.showBbsList = true
                    }else {
                        this.showBbsList = false
                    }
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
    created() {},
    watch: {
        changePlatform() {
            return this.$store.state.currentPlatform;
        },
        $route: {
            // 监听路由变化
            handler: function(val, oldVal) {
                // window.console.log("path---- ", this.$store.state.currentPlatform, this.platformList);
                if (this.$route.path == "/login") {
                    this.showLogin = true;
                } else {
                    this.showLogin = false;
                }
                // this.platformList = []
                this.platformList = UTILS.getStore("media_platform");
                this.currentPlatform = this.$store.state.currentPlatform;
                this.menuKey = new Date().valueOf();
                this.userInfo = this.$store.state.userInfo;
                if (this.currentPlatform.platform == "autohome") {
                    this.showBbsList = true;
                } else {
                    this.showBbsList = false;
                }
                // 选中左边菜单
                let path_name = this.$route.name;
                if (path_name == "abnormal") {
                    path_name = "finished";
                    this.showBbsList = false;
                }
                this.activeName =
                    this.currentPlatform.platform + "-" + path_name;
                this.openMenu = this.currentPlatform.platform;
                // window.console.log("showLogin ", this.showLogin);
                this.ckTopShowIco();
            },
            // 深度观察监听
            deep: true
        }
    },
    computed: {
        changePlatform: function() {
            // window.console.log("changePlatform ", this.$store.state.currentPlatform);
            // this.platformList = UTILS.getStore('media_platform')
            this.currentPlatform = this.$store.state.currentPlatform;
            this.userInfo = this.$store.state.userInfo;
            // window.console.log("currentPlatform: ", this.currentPlatform);
        }
    }
};
</script>
<style lang="less" scoped>
@import "./static/css/app";
@import "./static/css/chat_area";
</style>

<style scoped>
#app {
    background: #cbd6e1;
    width: 100vw;
    height: 100vh;
    background: url("./static/img/bg.jpg") 0px 0px no-repeat;
    background-size: 100% 100%;
}

.off-rl-ico {
    font-size: 26px;
    margin-left: 10px;
    cursor: pointer;
    color: #b4bccc;
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
    text-align: center;
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
    color: #b4bccc;
    cursor: pointer;
}
</style>
