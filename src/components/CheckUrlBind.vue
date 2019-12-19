<template>
    <div class="find-box">
        <!-- normal状态 -->
        <div v-show="modalStatus == 'normal'">
            <div class="f-title">智能排查</div>
            <div class="find-tips-box">
                <div class="f-desc-item">
                    1.点击“去复制账号链接”，将打开{{
                        info.name
                    }}个人主页，若未登录请先登录账号
                </div>
                <div class="f-desc-item">
                    2.从浏览器地址栏中复制地址，返回确认“关联帐号”即可。
                </div>
                <div class="f-eg">
                    链接地址类似：{{ urlText[info.platform] }}
                </div>
            </div>
            <div class="f-footer">
                <Button
                    class="f-btn middle"
                    size="large"
                    type="primary"
                    @click="toJump"
                    >去复制账号链接</Button
                >
            </div>
        </div>

        <!-- scan状态 -->
        <div class="f-scan" v-show="modalStatus == 'scan'">
            <div v-show="!supportClipboard">
                <div class="f-loading-tips mgb">请粘贴关联账号链接</div>
                <Input v-model="pastedVal" placeholder="" autofocus="autofocus" @input="onInput" />
            </div>
            <div v-show="supportClipboard">
                <img
                    src="https://allmark.oss-cn-shenzhen.aliyuncs.com/img/logo/scanning.gif"
                    alt=""
                />
                <div class="f-loading-tips">请稍等，动作扫描中...</div>
            </div>
            <div class="f-footer">
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
        <div v-show="modalStatus == 'result'">
            <div v-for="(itemf, index) in fansList" v-show="(fansList.length == 1)">
                <div class="f-desc-item">已扫描到“{{itemf.name}}”，是否关联该帐号？</div>
            </div>
            <div
                class="f-tag"
                :class="{ active: curFansItem.user_id == itemf.user_id }"
                v-for="(itemf, index) in fansList"
                @click="fItemClick(itemf)"
                v-show="(fansList.length > 1)"
            >
                <span class="f-tag-text">{{ itemf.name }}</span>
            </div>
            <div class="f-footer">
                <Button class="f-btn inline" size="large" @click="resetBind"
                    >重新复制</Button
                >
                <Button
                    class="f-btn inline"
                    size="large"
                    type="primary"
                    :loading="bindLoading"
                    @click="confirmCheck"
                    >确定关联</Button
                >
            </div>
        </div>
    </div>
</template>

<script>
import * as API from "../api/api";
import * as UTILS from "../api/utils";
import bus from "../api/bus";

export default {
    name: "CheckUrlBind",
    data() {
        return {
            info: {},
            jumpLink: "https://weibo.com/",
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
            console.log("supportClipboard: ", this.supportClipboard);
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
        getFans() {
            var _ = this;
            var params = {
                target_id: this.searchValue,
                media_platform: this.info.platform
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
        searchValue(val) {
            let _ = this;
            window.console.log(_.info.platform);
            if (val) {
                if (
                    (_.info.platform == "autohome" &&
                        val.indexOf("i.autohome.com.cn") > -1) ||
                    (_.info.platform == "weibo" &&
                        val.indexOf("weibo.com") > -1)
                ) {
                    clearTimeout(_.timerClip);
                    _.getFans();
                }
            }
        }
    },
    mounted() {
        this.get_info();
    },
    beforeDestroy() {
        clearTimeout(this.timerClip);
    }
};
</script>

<style scoped>
.find-box {
    height: 100%;
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
.f-loading-tips.mgt {
    
}
.f-loading-tips.mgb {
    margin-bottom: 20px;
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
</style>
