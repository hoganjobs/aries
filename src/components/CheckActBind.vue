<template>
    <div class="find-box">
        <!-- normal状态 -->
        <div class="f-start" v-show="modalStatus == 'normal'">
            <div class="f-title">智能排查</div>
            <div class="find-tips-box">
                <div class="f-desc-item">
                    点击“去{{ actText[info.platform] }}”，进入{{
                        info.name
                    }}，{{
                        actText[info.platform]
                    }}我们随机提供的账号，系统将会扫描你的{{
                        actText[info.platform]
                    }}动作，并提供候选账号昵称给你进行确认。
                </div>
                <div class="f-eg">
                    注：已{{ actText[info.platform] }}账号请取消{{ actText[info.platform] }}后再次{{
                        actText[info.platform]
                    }}
                </div>
            </div>
            <div class="f-footer">
                <Button
                    class="f-btn middle"
                    size="large"
                    type="primary"
                    @click="toJump"
                    >去{{ actText[info.platform] }}</Button
                >
            </div>
        </div>
        <!-- start状态 -->
        <div class="f-start" v-show="modalStatus == 'start'">
            <div class="f-title">智能排查</div>
            <div class="find-tips-box">
                <div class="f-desc-item">
                    点击“我已{{ actText[info.platform] }}，请扫描”，系统将会扫描你的{{ actText[info.platform] }}动作，并提供候选账号昵称给你进行确认。
                </div>
                <div class="f-eg">
                    注：已{{ actText[info.platform] }}账号请取消{{ actText[info.platform] }}后再次{{
                        actText[info.platform]
                    }}
                </div>
            </div>
            <div class="f-footer">
                <Button class="f-btn inline" size="large" @click="resetBind"
                    >重新{{ actText[info.platform] }}</Button
                >
                <Button
                    class="f-btn inline"
                    size="large"
                    type="primary"
                    :loading="bindLoading"
                    @click="confirmScan"
                    >我已{{ actText[info.platform] }}，请扫描</Button
                >
            </div>
        </div>
        <!-- scan状态 -->
        <div class="f-scan" v-show="modalStatus == 'scan'">
            <img src="https://allmark.oss-cn-shenzhen.aliyuncs.com/img/logo/scanning.gif" alt="" />
            <div class="f-loading-tips">请稍等，动作扫描中...</div>
            <div class="f-footer" v-show="modalStatus == 'scan'">
                <Button
                    class="f-btn middle"
                    size="large"
                    type="default"
                    @click="cancelScan"
                    >取消扫描</Button
                >
            </div>
        </div>
        <!-- result状态 -->
        <div class="f-result" v-show="modalStatus == 'result'">
            <div class="fans-refreshed-box" @click="confirmScan">
                <i class="iconfont iconrefresh"></i>
            </div>
            <div v-show="modalStatus == 'result'">
                <div
                    class="f-tag"
                    :class="{ active: curFansItem.user_id == itemf.user_id }"
                    v-for="(itemf, index) in fansList"
                    :key="'f' + index"
                    @click="fItemClick(itemf)"
                    v-show="info.platform !== 'tieba'"
                >
                    <span class="f-tag-text">{{ itemf.name }}</span>
                </div>
                <div
                    class="f-tag"
                    :class="{ active: curFansItem.name == itemf.name }"
                    v-for="(itemf, index) in fansList"
                    :key="index"
                    @click="fItemClick(itemf)"
                    v-show="info.platform == 'tieba'"
                >
                    <span class="f-tag-text">{{ itemf.name }}</span>
                </div>
            </div>
            <div class="f-footer">
                <Button class="f-btn inline" size="large" @click="resetBind"
                    >重新{{ actText[info.platform] }}</Button
                >
                <Button
                    class="f-btn inline"
                    size="large"
                    type="primary"
                    :loading="bindLoading"
                    @click="confirmCheck"
                    >开始排查</Button
                >
            </div>
        </div>
    </div>
</template>

<script>
import * as API from "../api/api";
import * as UTILS from "../api/utils";
import bus from "../api/bus";
import merge from "webpack-merge";

export default {
    name: "CheckActBind",
    components: {
    },
    props: {
        id: String,
        // item: Object,
        activeName: String
    },
    data() {
        return {
            menuActive: "",
            linkValue: "",
            jumpLink: "",
            timerFans: null,
            targetId: null,
            hasResult: false,
            modalStatus: "normal", // normal | start | scan | result
            fansList: [],
            curFansItem: {},
            df_avatar: require("../static/img/default_hd.jpg"),
            info: {},
            is_relation: false,
            bindLoading: false, // 关联loading
            cache_key: "",
            actText: {
                weibo: "评论",
                qq: "评论",
                net_ease: "关注",
                tieba: "关注",
                sina: "评论",
                guba: "关注",
                xueqiu: "关注"
            }
        };
    },
    methods: {
        get_info() {
            this.info = this.$store.state.currentPlatform;
            this.modalStatus = "normal";
            this.getBindAccountLink();
        },
        fItemClick(itemf) {
            this.curFansItem = itemf;
        },
        resetBind() {
            this.modalStatus = "normal";
            this.getBindAccountLink();
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
        confirmCheck() {
            let curr_fans = this.curFansItem;
            if (curr_fans == "{}") {
                UTILS.blToast("请选择要关联的账号");
            } else {
                this.$emit("checkAccount", curr_fans);
            }
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
        getBindAccountLink() {
            var _ = this;
            var params = {
                media_platform: this.info.platform,
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
            var cache_key = 'cache_key' +  (new Date()).valueOf()
            _.cache_key = cache_key
            var params = {
                media_platform: this.info.platform,
                target_id: this.targetId,
                cache_key: cache_key
            }
            API.getFansInfo(params);
        },
        getFans() {
            var _ = this;
            var params = {
                target_id: this.targetId,
                media_platform: this.info.platform,
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
                            UTILS.blToast("未扫描到关注动作！");
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
        activeName(val) {}
    },
    computed: {
        // 是否当前
        isCurrent() {
            return (
                this.$store.state.currentPlatform.platform == this.item.platform
            );
        },
        // 是否显示消息小红点
        isHasNewMsg() {
            return this.$store.state.noRead.includes(String(this.id));
        }
    },
    mounted() {
        this.get_info();
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.find-box {
    height: 100%;
    background: #ffffff;
    padding: 22px 32px 36px 32px;
    margin-bottom: 20px;
    position: relative;
}
.f-title {
    font-family: PingFang-SC-Medium;
    font-size: 24px;
    color: #333333;
    letter-spacing: -1.39px;
    text-align: center;
    margin-bottom: 20px;
}

.f-desc-item {
    font-family: PingFang-SC-Regular;
    font-size: 16px;
    color: #2a2a2a;
    letter-spacing: 0;
    line-height: 36px;
}

.f-eg {
    font-family: PingFang-SC-Regular;
    font-size: 14px;
    color: #999999;
    letter-spacing: -0.88px;
    margin: 24px 0 28px;
}
.f-btn.middle {
    display: block;
    margin: 0 auto 28px;
}
.f-btn.inline {
    margin: 0 20px;
}
.f-scan {
    padding: 100px;
    text-align: center;
}
.f-footer {
    margin-top: 60px;
    text-align: center;
}
.f-loading-tips {
    margin-top: 10px;
    font-family: PingFang-SC-Regular;
    font-size: 18px;
    color: #4a4a4a;
    letter-spacing: -2.08px;
    text-align: center;
}
.ivu-tag-size-large {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    margin-right: 13px;
}
.ivu-btn.ivu-btn-default.f-btn {
    color: #333;
    border-color: #dcdfe6;
}
.f-tag {
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
.f-tag.active {
    color: #2d8cf0;
    border: 1px solid #2d8cf0;
    background-color: #fff;
}
.fans-refreshed-box {
    position: absolute;
    right: 5px;
    top: 12px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    line-height: 40px;
}
.fans-refreshed-box .iconfont{
    font-size: 20px;
    color: #333;
}
</style>
