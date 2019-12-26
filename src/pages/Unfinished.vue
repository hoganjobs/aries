<template>
    <div class="unfinished-box">
        <div class="abnormal-task">
            <div v-show="showTabs">
                <div class="type-select-box" v-show="tabIndex == 'all'">
                    <Select
                        v-model="selectVal"
                        :value="selectVal"
                        @on-change="typeChange"
                        style="width:94px"
                    >
                        <Option
                            v-for="item in typeList"
                            :value="item.value"
                            :key="item.value"
                            >{{ item.label }}</Option
                        >
                    </Select>
                </div>
            </div>
            <div class="bl-tabs">
                <div class="task-list-top" v-show="!showTabs">
                    待做任务列表
                </div>
                <Tabs value="all" @on-click="clickTab" v-show="showTabs">
                    <TabPane label="帖子" name="all"> </TabPane>
                    <TabPane label="精华" name="jh"> </TabPane>
                    <TabPane label="视频" name="video"> </TabPane>
                    <TabPane label="问题" name="qa"> </TabPane>
                </Tabs>
                <div class="bl-task-table" v-show="abnormalTb.length > 0">
                    <Table :data="abnormalTb" :columns="abnormalTbColumns">
                        <template slot-scope="{ row }" slot="title">
                            <TaskArticle :item="row.title"></TaskArticle>
                        </template>
                        <template slot-scope="{ row }" slot="hd">
                            <div class="hd-btn-box">
                                <Button
                                    v-if="!row.hd.related_info"
                                    @click="toComment(row.title)"
                                    >{{ row.hd.name }}
                                </Button>
                                <Poptip
                                    title="口径"
                                    v-if="row.hd.related_info"
                                    trigger="hover"
                                    :content="row.hd.related_info || ' '"
                                    word-wrap
                                    width="180"
                                    placement="bottom-end"
                                >
                                    <Button @click="toComment(row.title)">{{
                                        row.hd.name
                                    }}</Button>
                                </Poptip>
                            </div>
                        </template>
                    </Table>
                </div>
            </div>
            <div
                style="padding: 10px;overflow: hidden;background: #fff"
                v-show="abnormalTb.length > 0"
            >
                <div style="float: right;">
                    <Page
                        :total="pageTotal"
                        :page-size="limit"
                        :current="begin + 1"
                        @on-change="changePage"
                    ></Page>
                </div>
            </div>
            <NoData v-show="abnormalTb.length == 0 && !spinShow"></NoData>
        </div>
        <Spin fix v-if="spinShow">
            <Icon
                type="ios-loading"
                size="32"
                class="demo-spin-icon-load"
            ></Icon>
            <div>加载中</div>
        </Spin>
    </div>
</template>

<script>
import * as API from "../api/api";
import * as UTILS from "../api/utils";
import bus from "../api/bus";
import TaskArticle from "../components/TaskArticle";
import NoData from "../components/NoData";

export default {
    name: "Unfinished",
    components: {
        TaskArticle,
        NoData
    },
    data() {
        return {
            showTabs: false, // 显示过滤
            spinShow: false,
            pageTotal: 0,
            begin: 0,
            limit: 6,
            selectVal: "all", // 当前选择的下拉过滤
            typeList: [
                {
                    value: "all",
                    label: "全部"
                },
                {
                    value: "top",
                    label: "置顶"
                },
                {
                    value: "jx",
                    label: "精选"
                },
                {
                    value: "qa",
                    label: "问题"
                },
                {
                    value: "jh",
                    label: "精华"
                }
            ],
            abnormalTb: [],
            abnormalTbColumns: [
                {
                    title: "帖子标题",
                    key: "title",
                    slot: "title"
                    // width: 280
                },
                {
                    title: "操作",
                    key: "hd",
                    slot: "hd",
                    width: 113
                }
            ],
            curTabType: "", // 当前tab类型
            tabIndex: "all", // 当前tab
            media_platform: "", // 当前平台
            bbsList: [] // 论坛列表
        };
    },
    methods: {
        // 选择下拉过滤
        typeChange(val) {
            window.console.log(val);
            var type = val;
            if (val == "all") {
                type = "";
            }
            this.begin = 0;
            this.curTabType = type;
            this.tabIndex = "all";

            this.getTaskCount();
        },
        // tab切换
        clickTab(name) {
            window.console.log("tab切换");
            window.console.log(name);
            var type = name || this.curTabType;
            if (name == "all") {
                type = "";
            }
            if (name == "all" || name == "") {
                this.tabIndex = "all";
            } else {
                this.tabIndex = type;
            }
            window.console.log(this.tabIndex);

            this.begin = 0;
            this.curTabType = type;
            this.selectVal = "all";
            this.getTaskCount();
        },
        getTaskGrab() {
            var _ = this;
            _.spinShow = true;
            let bbs_id = UTILS.getStore("bbs")
                ? UTILS.getStore("bbs").bbs_id
                : "";
            let app_name = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").app_name
                : "";
            let media_platform = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").platform
                : "";
            var params = {
                article_type: _.curTabType || "",
                begin: _.begin * _.limit,
                limit: _.limit,
                media_platform: media_platform,
                app_name: app_name,
                bbs_id: bbs_id
            };
            API.getTaskGrab(params)
                .then(function(res) {
                    _.spinShow = false;

                    if (res.data.result) {
                        _.mockTableData1(res.data.issues);
                    } else {
                        UTILS.blToast(res.data.msg);
                    }
                })
                .catch(function() {
                    _.spinShow = false;
                    UTILS.blToast(_.GLOBAL.sysErrMsg);
                });
        },

        getTaskCount() {
            var _ = this;

            let bbs_id = UTILS.getStore("bbs")
                ? UTILS.getStore("bbs").bbs_id
                : "";
            let app_name = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").app_name
                : "";
            let media_platform = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").platform
                : "";
            this.showTabs =
                UTILS.getStore("currPlat").platform == "autohome"
                    ? true
                    : false;

            var params = {
                article_type: _.curTabType || "",
                media_platform: media_platform,
                app_name: app_name,
                bbs_id: bbs_id,
                is_count: true
            };
            API.getTaskGrab(params)
                .then(function(res) {
                    if (res.data.result) {
                        _.pageTotal = res.data.count;
                        _.getTaskGrab();
                    }
                })
                .catch(function() {});
        },
        toComment(art) {
            var _ = this;
            window.console.log(art);
            let media_platform = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").platform
                : "";
            let app_name = UTILS.getStore("currPlat")
                ? UTILS.getStore("currPlat").app_name
                : "";
            var params = new URLSearchParams();
            params.append("task_id", art.task_id);
            params.append("media_platform", media_platform);
            params.append("app_name", app_name);
            params.append("interactive_type", art.interactive_type);
            var winRef = window.open("", "_blank"); //打开一个新的页面
            API.taskGrad(params, "twin_web")
                .then(function(res) {
                    if (res.data.result) {
                        var params2 = new URLSearchParams();
                        params2.append("issue_id", res.data.task_id);
                        params2.append(
                            "interactive_type",
                            res.data.interactive_type
                        );
                        API.taskResolved(params2, "twin_web")
                            .then(function(res2) {
                                if (res2.data.result) {
                                    _.getTaskGrab();
                                    // window.open(art.url)
                                    setTimeout(function() {
                                        winRef.location = art.url; //改变页面的 location
                                    }, 300); //这个等待很重要，如果不等待的话将无法实现
                                }
                            })
                            .catch(function() {});
                    } else {
                        if (res.data.code == 891) {
                            _.getTaskGrab();
                        }
                        winRef.close();
                        UTILS.blToast(res.data.msg);
                    }
                })
                .catch(function() {});
        },
        mockTableData1(data) {
            var dt = [];
            for (let i = 0; i < data.length; i++) {
                let dti = data[i];
                let dsc = dti.description;
                // tag start
                let tagName = "";
                let tagColor = "";
                let hasVideo = false;
                let hasImg = false;
                if (dsc.article_type) {
                    // 问题 < 精华 < 精选
                    if (dsc.article_type.indexOf("qa") > -1) {
                        tagName = "问题";
                        tagColor = "bg-blue";
                    }
                    if (dsc.article_type.indexOf("jh") > -1) {
                        tagName = "精华";
                        tagColor = "bg-orange";
                    }
                    if (dsc.article_type.indexOf("jx") > -1) {
                        tagName = "精选";
                        tagColor = "bg-blue";
                    }
                    if (dsc.article_type.indexOf("video") > -1) {
                        hasVideo = true;
                    } else if (dsc.article_type.indexOf("img") > -1) {
                        hasImg = true;
                    }
                }

                // 随机分配
                let remain_can_grab_count = dti.remain_can_grab_count
                let cur_rm = "";
                if (remain_can_grab_count) {
                    let rm_count = Object.keys(remain_can_grab_count).length
                    var _math = Math.floor(Math.random() * rm_count);
                    _math = _math != 0 ? _math-- : _math
                    cur_rm = Object.keys(remain_can_grab_count)[_math]
                }
                const plat = UTILS.getStore('currPlat').platform;
                const cur_act = cur_rm.replace(plat + '_', '');
                const hd_name = "去" + this.$store.state.task_hd_text[cur_act] || "";

                // tag end
                dt.push({
                    title: {
                        task_id: dti.task_id,
                        title: dti.summary,
                        url: dsc.url,
                        tag: "top",
                        tagName: tagName,
                        tagColor: tagColor,
                        hasImg: hasImg,
                        hasVideo: hasVideo,
                        author: dti.creator.name,
                        interactive_type: cur_rm,
                        time: dti.date_submitted
                            ? UTILS.getDateDiff(dti.date_submitted * 1000)
                            : ""
                    },
                    hd: {
                        name: hd_name,
                        related_info: dti.steps_to_reproduce
                    }
                });
            }
            this.abnormalTb = dt;
        },
        changePage(e) {
            window.console.log(e);
            this.begin = e - 1;
            this.getTaskGrab();
        },
        getRefreshStatus() {
            var _ = this;
            let key = _.$route.name + "Refresh";
            console.log("::", key);
            bus.$off(key);
            bus.$on(key, () => {
                this.clickTab(this.curTabType);
            });
            let key2 = _.$route.name + "MenuClick";
            bus.$off(key2);
            bus.$on(key2, () => {
                this.showTabs =
                    UTILS.getStore("currPlat").platform == "autohome"
                        ? true
                        : false;
            });
        }
    },
    mounted() {
        this.getRefreshStatus();
    },
    created() {
        var _ = this;
        _.media_platform = _.$route.query.id;
        _.getTaskCount();
    }
};
</script>

<style scoped>
.unfinished-box {
    height: 100%;
    background: #fff;
}

.abnormal-task {
    position: relative;
    height: 100%;
}

.type-select-box {
    position: absolute;
    right: 20px;
    top: 11px;
    z-index: 2;
}

.hd-tips-btn {
    width: 22px;
    height: 22px;
    position: absolute;
    right: 15px;
    background: #999;
    top: 12px;
    border-radius: 50%;
    text-align: center;
    color: #fff;
    cursor: pointer;
}

.td-bottom {
    font-family: PingFang-SC-Regular;
    font-size: 14px;
    color: #999999;
    margin-top: 8px;
}

.td-author {
    margin-right: 38px;
}

a.t-title {
    font-family: PingFang-SC-Medium;
    font-size: 16px;
    color: #333333;
    width: 453px;
    line-height: 22px;
}
.task-list-top {
    padding: 16px 20px;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #e1e4eb;
}
</style>
