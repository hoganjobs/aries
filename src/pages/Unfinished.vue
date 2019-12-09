<template>
    <div class="unfinished-box">
        <div class="abnormal-task">
            <div class="type-select-box">
                <Select v-model="selectVal" :value="selectVal" @on-change="typeChange" style="width:94px">
                    <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>

            <div class="bl-tabs">
                <Tabs value="all" @on-click="clickTab">
                    <TabPane label="帖子" name="all">

                    </TabPane>
                    <TabPane label="精华" name="jh">

                    </TabPane>
                    <TabPane label="视频" name="video">

                    </TabPane>
                    <TabPane label="问题" name="qa">

                    </TabPane>
                </Tabs>
                <div class="bl-task-table" v-show="abnormalTb.length > 0">
                    <Table :data="abnormalTb" :columns="abnormalTbColumns">
                        <template slot-scope="{ row }" slot="title">
                            <TaskArticle :item="row.title "></TaskArticle>
                        </template>
                        <template slot-scope="{ row }" slot="hd">
                            <div class="hd-btn-box">
                                <Button v-if="!row.hd.related_info" @click="toComment(row.title)">{{row.hd.name}}
                                </Button>

                                <Poptip title="口径" v-if="row.hd.related_info" trigger="hover"
                                        :content="row.hd.related_info || ' '" word-wrap width="180"
                                        placement="bottom-end">
                                    <Button @click="toComment(row.title)">{{row.hd.name}}</Button>
                                </Poptip>
                            </div>

                        </template>
                    </Table>
                </div>

            </div>


            <div style="padding: 10px;overflow: hidden;background: #fff" v-show="abnormalTb.length > 0">
                <div style="float: right;">
                    <Page :total="pageTotal" :current="1" @on-change="changePage"></Page>
                </div>
            </div>
            <NoData v-show="abnormalTb.length == 0  && !spinShow"></NoData>


            <!--      <div class="hd-tips-btn" @click="showHdmodal">-->
            <!--      ?-->
            <!--      </div>-->
        </div>

        <Modal v-model="hdModal">
            <p slot="header" style="text-align:center">
                <span>汽车之家帖子回复任务执行步骤</span>
            </p>
            <div style="text-align:center">
                <p>After this task is deleted, the downstream 10 tasks will not be implemented.</p>
                <p>Will you delete it?</p>
            </div>
            <div slot="footer">
                <Button type="primary" size="large" long @click="closeHdModal">我知道了</Button>
            </div>
        </Modal>
        <Spin fix v-if="spinShow">
            <Icon type="ios-loading"  size=32 class="demo-spin-icon-load"></Icon>
            <div>加载中</div>
        </Spin>
    </div>
</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import TaskArticle from '../components/TaskArticle'
    import NoData from '../components/NoData'

    export default {
        name: "Unfinished",
        components: {
            TaskArticle,
            NoData
        },
        data() {
            return {
                spinShow: false,
                pageTotal: 0,
                begin: 0,
                limit: 6,
                selectVal: 'all', // 当前选择的下拉过滤
                hdModal: false, // 操作提示模态框
                typeList: [
                    {
                        value: 'all',
                        label: '全部'
                    },
                    {
                        value: 'top',
                        label: '置顶'
                    },
                    {
                        value: 'jx',
                        label: '精选'
                    },
                    {
                        value: 'qa',
                        label: '问题'
                    },
                    {
                        value: 'jh',
                        label: '精华'
                    },
                ],
                abnormalTb: [],
                abnormalTbColumns: [

                    {
                        title: '帖子标题',
                        key: 'title',
                        slot: 'title',
                        // width: 280
                    },
                    {
                        title: '操作',
                        key: 'hd',
                        slot: 'hd',
                        width: 113
                    }
                ],
                curTabType: '', // 当前tab类型
            }
        },
        methods: {
            // 选择下拉过滤
            typeChange(val) {
                window.console.log(val)
                var type = val
                if (name == 'all') {
                    type = ''
                }
                this.curTabType = type
                this.getTaskGrab()
            },
            // tab切换
            clickTab(name) {

                window.console.log(name)
                var type = name
                if (name == 'all') {
                    type = ''
                }
                this.curTabType = type
                this.getTaskCount()
                this.getTaskGrab()
            },
            getTaskGrab() {
                var _ = this;
                _.spinShow = true;
                var params = {
                    article_type: _.curTabType || '',
                    begin: _.begin * _.limit,
                    limit: _.limit,
                }
                API.getTaskGrab(params).then(function (res) {
                    _.spinShow = false;

                    if (res.data.result) {
                        _.mockTableData1(res.data.issues)
                    } else {
                        UTILS.blToast(res.data.msg)
                    }

                }).catch(function () {
                    _.spinShow = false;
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
            getTaskCount() {
                var _ = this;
                var params = {
                    article_type: _.curTabType || '',
                    is_count: true
                }
                API.getTaskGrab(params).then(function (res) {
                    if (res.data.result) {
                        _.pageTotal = res.data.count
                    }
                }).catch(function () {

                })
            },

            toComment(art) {
                var _ = this;
                window.console.log(art)
                var params = new URLSearchParams()
                params.append('task_id', art.task_id)
                params.append('interactive_type', 'random')
                API.taskGrad(params, 'mirror_mobile').then(function (res) {
                    if (res.data.result) {
                        var params2 = new URLSearchParams()
                        params2.append('issue_id', res.data.task_id)
                        params2.append('interactive_type', res.data.interactive_type)
                        API.taskResolved(params2).then(function (res2) {
                            if (res2.data.result) {
                                _.getTaskGrab()
                                window.open(art.url)
                            }
                        }).catch(function () {

                        })
                    }

                }).catch(function () {

                })

            },

            showHdmodal() {
                this.hdModal = true
            },
            closeHdModal() {
                this.hdModal = false
            },
            mockTableData1(data) {
                var dt = []
                for (let i = 0; i < data.length; i++) {
                    let dti = data[i];
                    let dsc = dti.description
                    let tagName = '';
                    let hasVideo = false;
                    let hasImg = false;
                    let tagColor = '';
                    if (dsc.article_type.indexOf('jh') > -1) {
                        tagName = '精华'
                        tagColor = 'bg-orange'
                    } else if (dsc.article_type.indexOf('qa') > -1) {
                        tagName = '问题'
                        tagColor = 'bg-blue'
                    } else if (dsc.article_type.indexOf('video') > -1) {
                        hasVideo = true
                    } else if (dsc.article_type.indexOf('img') > -1) {
                        hasImg = true
                    }
                    dt.push({
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
                            // error_status: dti.custom_fields_obj.error_status || null,
                            // operate_account: dti.custom_fields_obj.operate_account || null,
                        },
                        hd: {
                            name: '去评论',
                            related_info: dti.steps_to_reproduce
                        }
                    })

                }
                this.abnormalTb = dt


            },
            changePage(e) {
                window.console.log(e)
                this.begin = e - 1;
                this.getTaskGrab()
                // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
                // this.tableData1 = this.mockTableData1();
            },

        },
        mounted() {
            // UTILS.blToast('123')
        },
        created() {
            this.getTaskCount()
            this.getTaskGrab()
            UTILS.pageJump()

        },
        watch: {
            clickRefresh() {
                return this.$store.state.is_refresh
            }
        },
        computed: {
            clickRefresh() {
                this.clickTab(this.curTabType)
                window.console.log(this.$store.state.is_refresh)
            }
        },
    }
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
</style>
