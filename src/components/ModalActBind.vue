<template>
    <Modal
        class="bl-rl-md"
        :value="syncModalClose"
        :title="modalTitle"
        width="640px"
        @on-cancel="closeCancel"
    >
        <!-- normal状态 -->
        <div v-show="modalStatus == 'normal'">
            <div class="md-title">关联{{ item.name }}账号</div>
            <div class="md-body">
                <div class="md-desc-item">
                    点击“去{{ actText[item.platform] }}”，进入{{
                    item.name
                    }}，{{
                    actText[item.platform]
                    }}我们随机提供的账号，系统将会扫描你的{{
                    actText[item.platform]
                    }}动作，并提供候选账号昵称给你进行确认。
                </div>
                <div class="md-eg">
                    注：已关注账号请取消{{ actText[item.platform] }}后再次{{
                    actText[item.platform]
                    }}
                </div>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'normal'">
            <Button
                class="md-btn middle"
                size="large"
                type="primary"
                @click="toJump"
            >去{{ actText[item.platform] }}</Button>
        </div>

        <!-- start状态 -->
        <div v-show="modalStatus == 'start'">
            <div class="md-title">关联{{ item.name }}账号</div>
            <div class="md-body">
                <div class="md-desc-item">
                    点击“我已{{
                    actText[item.platform]
                    }}，请扫描”，系统将会扫描你的{{
                    actText[item.platform]
                    }}动作，并提供候选账号昵称给你进行确认。
                </div>
                <div class="md-eg">
                    注：已{{ actText[item.platform] }}账号请取消{{
                    actText[item.platform]
                    }}后再次{{ actText[item.platform] }}
                </div>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'start'">
            <Button class="md-btn" size="large" @click="resetBind">重新{{ actText[item.platform] }}</Button>
            <Button
                class="md-btn"
                size="large"
                type="primary"
                :loading="bindLoading"
                @click="confirmScan"
            >我已{{ actText[item.platform] }}，请扫描</Button>
        </div>

        <!-- scan状态 -->
        <div class="md-scan" v-show="modalStatus == 'scan'">
            <img src="https://allmark.oss-cn-shenzhen.aliyuncs.com/img/logo/scanning.gif" alt />
            <div class="md-loading-tips">请稍等，动作扫描中...</div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'scan'">
            <Button class="md-btn middle" size="large" type="default" @click="cancelScan">取消扫描</Button>
        </div>

        <!-- result状态 -->
        <div slot="header" class="md-header" v-show="modalStatus == 'result'">
            关联{{ item.name }}账号
            <div class="fans-refreshed-box" @click="confirmScan">
                <i class="iconfont iconrefresh"></i>
            </div>
        </div>
        <div v-show="modalStatus == 'result'">
            <div
                class="md-tag"
                :class="{ active: curFansItem.user_id == itemf.user_id }"
                v-for="(itemf, index) in fansList"
                :key="'f' + index"
                @click="fItemClick(itemf)"
                v-show="item.platform !== 'tieba'"
            >
                <span class="md-tag-text">{{ itemf.name }}</span>
            </div>
            <div
                class="md-tag"
                :class="{ active: curFansItem.name == itemf.name }"
                v-for="(itemf, index) in fansList"
                :key="index"
                @click="fItemClick(itemf)"
                v-show="item.platform == 'tieba'"
            >
                <span class="md-tag-text">{{ itemf.name }}</span>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'result'">
            <Button class="md-btn" size="large" @click="resetBind">重新{{ actText[item.platform] }}</Button>
            <Button
                class="md-btn"
                size="large"
                type="primary"
                :loading="bindLoading"
                @click="confirmBind"
            >确定关联</Button>
        </div>
    </Modal>
</template>

<script>
import * as API from "../api/api";
import * as UTILS from "../api/utils";
import bus from "../api/bus";

export default {
    name: "ModalActBind",
    components: {},
    props: {
        syncModalClose: Boolean,
        item: Object
    },
    data() {
        return {
            jumpLink: "",
            timerFans: null,
            targetId: null,
            modalStatus: "normal", // normal | start | scan | result 维护显示内容
            fansList: [],
            curFansItem: {},
            modalTitle: " ",
            bindLoading: false, // 关联loading
            cache_key: "",
            actText: {
                weibo: "评论",
                qq: "评论",
                net_ease: "关注",
                tieba: "关注",
                sina: "评论"
            }
        };
    },
    methods: {
        closeCancel() {
            this.$emit("update:syncModalClose", false);
        },
        get_info() {
            this.modalStatus = "normal";
            this.getBindAccountLink();
        },
        fItemClick(itemf) {
            this.curFansItem = itemf;
        },
        resetBind() {
            this.modalStatus = "normal";
            this.getBindAccountLink("reset");
        },
        confirmScan() {
            let _ = this;
            this.modalStatus = "scan";
            let duration = 1 * 1000;
            clearTimeout(_.timerFans);
            _.timerFans = setTimeout(function() {
                _.getFans();
            }, duration);
        },
        cancelScan() {
            this.modalStatus = "start";
            clearTimeout(this.timerFans);
        },
        toJump() {
            let _ = this;
            if (this.jumpLink) {
                _.modalStatus = "start";
                window.open(this.jumpLink);
                // 初始化粉丝列表
                _.getFansOrg();
            }
        },
        // 关联第三方账号
        confirmBind() {
            var _ = this;
            var params = new URLSearchParams();
            let info = _.curFansItem;
            window.console.log(info);
            info = JSON.stringify(info);
            if (info == "{}") {
                UTILS.blToast("请选择要关联的账号");
            } else {
                var currPlat = _.$store.state.currentPlatform;
                var open_type = currPlat.app_name;
                params.append("open_type", open_type);
                params.append("oauth_user_info", info);
                API.bindAccount(params)
                    .then(function(res) {
                        var _d = res.data;
                        if (_d.result) {
                            UTILS.blToast("关联成功");
                            let oauth_user_info = {
                                name: _d.oauth_user_info.name,
                                avatar: _d.oauth_user_info.avatar,
                                user_id: _d.oauth_user_info.user_id
                            };
                            currPlat.user = oauth_user_info;
                            currPlat.is_relation = true;
                            let m_ls = UTILS.getStore("media_platform");
                            for (let i = 0; i < m_ls.length; i++) {
                                if (m_ls[i].app_name == open_type) {
                                    m_ls[i].is_relation = true;
                                    m_ls[i].user = oauth_user_info;
                                }
                            }
                            let user = UTILS.getStore("userInfo");
                            user.bind_account[open_type] = oauth_user_info;
                            UTILS.setStore("media_platform", m_ls);
                            UTILS.setStore("userInfo", user);
                            UTILS.setStore("currPlat", currPlat);
                            _.$store.commit("changePlatform", currPlat);
                            _.$router.push({
                                path: "/unfinished",
                                query: {
                                    id: open_type
                                }
                            });
                            bus.$emit(
                                "unfinishedMenuClick",
                                "unfinishedMenuClick"
                            );
                        } else {
                            UTILS.blToast(_d.msg);
                        }
                    })
                    .catch(function() {
                        UTILS.blToast(_.GLOBAL.sysErrMsg);
                    });
            }
        },
        getBindAccountLink() {
            var _ = this;
            var params = {
                media_platform: this.item.platform,
                action_type: "web"
            };
            API.getBindAccount(params)
                .then(function(res) {
                    if (res.data.result) {
                        _.targetId = res.data.target_id;
                        _.jumpLink = res.data.url;
                    }
                })
                .catch(function() {
                    UTILS.blToast(_.GLOBAL.sysErrMsg);
                });
        },
        getFansOrg() {
            var _ = this;
            var cache_key = "cache_key" + new Date().valueOf();
            _.cache_key = cache_key;
            var params = {
                media_platform: this.item.platform,
                target_id: this.targetId,
                cache_key: cache_key
            };
            API.getFansInfo(params);
        },
        getFans() {
            var _ = this;
            var params = {
                target_id: this.targetId,
                media_platform: this.item.platform,
                cache_key: _.cache_key
            };
            API.getFansInfo(params)
                .then(function(res) {
                    if (res.data.result) {
                        let fans_list = res.data.bind_info;
                        if (fans_list.length) {
                            _.modalStatus = "result";
                            _.fansList = fans_list;
                            _.curFansItem = fans_list[0];
                        } else {
                            UTILS.blToast("未扫描到关联动作！");
                            _.modalStatus = "start";
                        }
                    }
                })
                .catch(function() {
                    UTILS.blToast(_.GLOBAL.sysErrMsg);
                });
        }
    },
    watch: {
        syncModalClose(val) {
            if (val) {
                this.get_info();
            }
        }
    },
    mounted() {}
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.md-body {
    width: 480px;
    margin: 0 auto;
}
.md-desc-item {
    font-family: PingFang-SC-Regular;
    font-size: 16px;
    color: #2a2a2a;
    letter-spacing: 0;
    line-height: 36px;
}

.md-eg {
    font-family: PingFang-SC-Regular;
    font-size: 14px;
    color: #999999;
    letter-spacing: -0.88px;
    margin: 24px 0 28px;
}
.md-btn.middle {
    display: block;
    margin: 0 auto 28px;
}
.md-header {
    padding-top: 10px;
    font-size: 18px;
    color: #333333;
}
.md-footer {
    text-align: right;
}
.md-loading-tips {
    font-family: PingFang-SC-Regular;
    font-size: 18px;
    color: #4a4a4a;
    letter-spacing: -2.08px;
    text-align: center;
}
.md-tag {
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
.md-tag.active {
    color: #2d8cf0;
    border: 1px solid #2d8cf0;
    background-color: #fff;
}
.md-scan {
    text-align: center;
}
.fans-refreshed-box {
    display: inline-block;
    cursor: pointer;
}
.fans-refreshed-box .iconfont {
    font-size: 16px;
    color: #333;
}
.ivu-tag-size-large {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    margin-right: 13px;
}
.ivu-btn.ivu-btn-default.md-btn {
    color: #333;
    border-color: #dcdfe6;
}
</style>
