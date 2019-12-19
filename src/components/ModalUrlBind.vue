<template>
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
                    1.点击“去复制账号链接”，将打开{{
                        item.name
                    }}个人主页，若未登录请先登录账号
                </div>
                <div class="md-desc-item">
                    2.从浏览器地址栏中复制地址，返回确认“关联帐号”即可。
                </div>
                <div class="md-eg">
                    链接地址类似：{{ urlText[item.platform] }}
                </div>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'normal'">
            <Button
                class="md-btn middle"
                size="large"
                type="primary"
                @click="toJump"
                >去复制账号链接</Button
            >
        </div>

        <!-- scan状态 -->
        <div class="md-scan" v-show="modalStatus == 'scan'">
            <div v-show="!supportClipboard">
                <div class="md-loading-tips mgb">请粘贴关联账号链接</div>
                <Input v-model="pastedVal" placeholder="" autofocus="autofocus" @input="onInput" />
            </div>
            <div v-show="supportClipboard">
                <img
                    src="https://allmark.oss-cn-shenzhen.aliyuncs.com/img/logo/scanning.gif"
                    alt=""
                />
                <div class="md-loading-tips">请稍等，动作扫描中...</div>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'scan'">
            <Button
                class="md-btn middle"
                size="large"
                type="default"
                @click="cancelScan"
                >取消扫描</Button
            >
        </div>

        <!-- result状态 -->
        <div slot="header" class="md-header" v-show="modalStatus == 'result'">
            关联{{ item.name }}账号
        </div>
        <div v-show="modalStatus == 'result'">
            <div v-for="(itemf, index) in fansList" v-show="(fansList.length == 1)">
                <div class="md-desc-item">已扫描到“{{itemf.name}}”，是否关联该帐号？</div>
            </div>
            <div
                class="md-tag"
                :class="{ active: curFansItem.user_id == itemf.user_id }"
                v-for="(itemf, index) in fansList"
                @click="fItemClick(itemf)"
                v-show="(fansList.length > 1)"
            >
                <span class="md-tag-text">{{ itemf.name }}</span>
            </div>
        </div>
        <div slot="footer" class="md-footer" v-show="modalStatus == 'result'">
            <Button class="md-btn" size="large" @click="resetBind"
                >重新复制</Button
            >
            <Button
                class="md-btn"
                size="large"
                type="primary"
                :loading="bindLoading"
                @click="confirmBind"
                >确定关联</Button
            >
        </div>
    </Modal>
</template>

<script>
import * as API from "../api/api";
import * as UTILS from "../api/utils";
import bus from "../api/bus";

export default {
    name: "ModalUrlBind",
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
            searchValue: "",
            pastedVal: "",
            timerClip: null,
            supportClipboard: true,
            urlText: {
                autohome: "https://i.autohome.com.cn/132132141",
                weibo: "https://weibo.com/u/132132141/home?wvr=5"
            }
        };
    },
    methods: {
        closeCancel() {
            this.$emit("update:syncModalClose", false);
        },
        // 监测输入框是否有粘贴内容
        onInput(val) {
            if(val != '') {
                this.searchValue = val;
                this.getFans();
                this.pastedVal = "";
            }
        },
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
            this.getBindAccountLink("reset");
        },
        cancelScan() {
            this.modalStatus = "normal";
        },
        toJump() {
            let _ = this;
            if (_.jumpLink) {
                _.searchValue = "";
                if (navigator.clipboard) { // 浏览器支持clipboard api
                    // 扫描前先清除剪切板
                    _.clearClipboard();
                    _.getClipboard();
                } else { // 浏览器不支持clipboard api
                    _.supportClipboard = false;
                }
                // 打开主页
                window.open(_.jumpLink);
                _.modalStatus = "scan";
            }
        },
        getClipboard() {
            var _ = this;
            clearTimeout(this.timerClip);
            this.timerClip = setTimeout(function() {
                _.getClipboard();
                window.console.log("setIntervalt: ");
                if (_.modalStatus == "scan") {
                    _.getClipboardContents();
                }
            }, 2000);
        },
        async clearClipboard() {
            try {
                await navigator.clipboard.writeText("");
                window.console.log("writeText");
            } catch (err) {
                window.console.log("writeText error", err);
            }
        },
        async getClipboardContents() {
            let _ = this;
            try {
                const text = await navigator.clipboard.readText();
                window.console.log("Pasted content: ", text);
                if (text) { _.searchValue = text }
            } catch (err) {
                window.console.log("Pasted err", err);

                navigator.permissions
                    .query({ name: "clipboard-read" })
                    .then(function(result) {
                        if (result.state == "denied") {
                            UTILS.blToast({
                                content:
                                    "获取剪贴板内容被禁止，请前往浏览器设置中打开",
                                duration: 5
                            });
                            clearTimeout(_.timerClip);
                        }
                    });
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
                // var currPlat = UTILS.getStore('currPlat');
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
        getFans() {
            var _ = this;
            var params = {
                target_id: this.searchValue,
                media_platform: this.item.platform
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
                            UTILS.blToast("未扫描到链接账号！");
                            _.modalStatus = "normal";
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
        },
        searchValue(val) {
            let _ = this;
            window.console.log(_.item.platform);
            window.console.log(val, " @ ", val.indexOf("weibo.com") > -1);
            if (val) {
                if (
                    (_.item.platform == "autohome" &&
                        val.indexOf("i.autohome.com.cn") > -1) ||
                    (_.item.platform == "weibo" &&
                        val.indexOf("weibo.com/") > -1)
                ) {
                    clearTimeout(_.timerClip);
                    _.getFans();
                }
            }
        }
    },
    mounted() {},
    beforeDestroy() {
        clearTimeout(this.timerClip);
    }
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
.md-btn.right {
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
.md-loading-tips.mgt {
    
}
.md-loading-tips.mgb {
    margin-bottom: 20px;
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
