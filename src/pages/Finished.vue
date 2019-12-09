<template>
    <div class="finished-box">
        <div class="all-total-box">
            合计：{{allTotal}}
        </div>
        <div class="bl-tabs">
            <Tabs :value="active" @on-click="clickTab">
                <TabPane :label="'验收异常（'+ pageTotal.abnormal +'）'" name="abnormal">
                    <div v-show="abnormalTb.length > 0">
                        <div class="bl-task-table">
                            <Table :data="abnormalTb" :columns="abnormalTbColumns">
                                <template slot-scope="{ row }" slot="title">
                                    <TaskArticle :item="row.title "></TaskArticle>
                                </template>
                                <template slot-scope="{ row }" slot="hd">
                                    <div class="hd-btn-box" style="text-align: right">
                                        <div class="" v-if="row.title.error_status == 'no_action'">
                                            <Button @click="aiDebug(row.title)">智能排查
                                            </Button>

                                            <Poptip title="口径" v-if="row.hd.related_info" trigger="hover"
                                                    :content="row.hd.related_info || ' '" word-wrap width="180"
                                                    placement="bottom-end">
                                                <Button @click="toComment(row.title)">{{row.hd.name}}</Button>
                                            </Poptip>
                                        </div>
                                        <div class="" v-if="row.title.error_status !== 'no_action'">
                                            <Button v-if="!row.hd.related_info" @click="toComment(row.title)">
                                                {{row.hd.name}}
                                            </Button>

                                            <Poptip title="口径" v-if="row.hd.related_info" trigger="hover"
                                                    :content="row.hd.related_info || ' '" word-wrap width="180"
                                                    placement="bottom-end">
                                                <Button @click="toComment(row.title)">{{row.hd.name}}</Button>
                                            </Poptip>
                                        </div>

                                    </div>
                                </template>
                            </Table>
                        </div>
                        <div style="padding: 10px;overflow: hidden;background: #fff">
                            <div style="float: right;">
                                <Page :total="pageTotal.abnormal" :page-size="limit" :current="1"
                                      @on-change="changePage"></Page>
                            </div>
                        </div>
                    </div>
                    <NoData v-show="abnormalTb.length == 0 && !spinShow"></NoData>

                </TabPane>
                <TabPane :label="'待验收（'+ pageTotal.pending +'）'" name="pending">
                    <div v-show="pendingTb.length > 0">
                        <div class="bl-task-table">
                            <Table :data="pendingTb" :columns="pendingTbColumns">
                                <template slot-scope="{ row }" slot="title">
                                    <TaskArticle :item="row.title "></TaskArticle>
                                </template>
                                <template slot-scope="{ row }" slot="hd">
                                    <div class="hd-btn-box tips-text dpflex pending-hd-box" style="text-align: right">
                                        <div class="">
                                            <Button v-if="!row.hd.related_info" @click="toComment(row.title)">去评论
                                            </Button>

                                            <Poptip title="口径" v-if="row.hd.related_info" trigger="hover"
                                                    :content="row.hd.related_info || ' '" word-wrap width="180"
                                                    placement="bottom-end">
                                                <Button @click="toComment(row.title)">去评论</Button>
                                            </Poptip>
                                        </div>
                                        <div>已等待验收{{row.hd.exp}}</div>
                                    </div>
                                </template>
                            </Table>
                        </div>
                        <div style="padding: 10px;overflow: hidden;background: #fff">
                            <div style="float: right;">
                                <Page :total="pageTotal.pending" :page-size="limit" :current="1"
                                      @on-change="changePage"></Page>
                            </div>
                        </div>
                    </div>
                    <NoData v-show="pendingTb.length == 0 && !spinShow"></NoData>

                </TabPane>
                <TabPane :label="'已验收（'+ pageTotal.finished +'）'" name="finished">
                    <div v-show="finishedTb.length > 0">

                        <div class="bl-task-table">
                            <Table :data="finishedTb" :columns="finishedTbColumns">
                                <template slot-scope="{ row }" slot="title">
                                    <TaskArticle :item="row.title "></TaskArticle>
                                </template>
                                <template slot-scope="{ row }" slot="exp">
                                    <div class="hd-btn-box tips-text" style="text-align: right">
                                        <div v-if="row.exp == '刚刚'">{{row.exp}}已验收</div>
                                        <div v-if="row.exp != '刚刚'">{{row.exp}}前已验收</div>
                                    </div>
                                </template>
                            </Table>
                            <div style="padding: 10px;overflow: hidden;background: #fff">
                                <div style="float: right;">
                                    <Page :total="pageTotal.finished" :page-size="limit" :current="1"
                                          @on-change="changePage"></Page>
                                </div>
                            </div>
                        </div>
                        <NoData v-show="finishedTb.length == 0 && !spinShow"></NoData>

                    </div>
                </TabPane>
            </Tabs>
        </div>
        <Spin fix v-if="spinShow">
            <Icon type="ios-loading" size=32 class="demo-spin-icon-load"></Icon>
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
        name: "Finished",
        components: {
            TaskArticle,
            NoData
        },
        data() {
            return {
                spinShow: false,
                getCountIndex: 0, // 获取
                refresh: null,
                pageTotal: {
                    abnormal: 0,
                    pending: 0,
                    finished: 0,
                },
                allTotal: 0,
                begin: {
                    abnormal: 0,
                    pending: 0,
                    finished: 0,
                },
                limit: 6,
                active: 'abnormal', // abnormal 异常 | pending 待验收 | finished 已验收
                abnormalTb: [],
                pendingTb: [],
                finishedTb: [],
                abnormalTbColumns: [

                    {
                        title: '帖子标题',
                        key: 'title',
                        slot: 'title',
                        // width: 500
                    },
                    {
                        title: '处理建议',
                        key: 'hd',
                        slot: 'hd',
                        width: 200
                    },
                ],
                pendingTbColumns: [

                    {
                        title: '帖子标题',
                        key: 'title',
                        slot: 'title',
                    },
                    {
                        title: '说明信息',
                        key: 'hd',
                        slot: 'hd',
                        width: 240
                    }
                ],
                finishedTbColumns: [
                    {
                        title: '帖子标题',
                        key: 'title',
                        slot: 'title',
                    },
                    {
                        title: '说明信息',
                        key: 'exp',
                        slot: 'exp',
                        width: 240
                    }
                ],
            }
        },
        methods: {
            getTicketsCount(status, get_error_status, type) {
                var _ = this;

                var params = {
                    status: status,
                    get_error_status: get_error_status || null,
                    is_count: true
                }
                API.getTickets(params).then(function (res) {
                    if (res.data.result) {
                        _.pageTotal[type] = res.data.count
                        _.allTotal = _.pageTotal.abnormal + _.pageTotal.pending + _.pageTotal.finished
                        _.getCountIndex++
                        if (_.getCountIndex == 3) {
                            _.renderFirstTab()
                        }
                    }
                }).catch(function () {
                })
            },
            renderFirstTab() {
                var _ = this;
                if (_.pageTotal.abnormal > 0) {
                    _.active = 'abnormal'
                } else if (_.pageTotal.pending > 0) {
                    _.active = 'pending'
                } else if (_.pageTotal.finished > 0) {
                    _.active = 'finished'
                } else {
                    _.active = 'abnormal'
                }
            },
            getTickets(status, get_error_status) {
                var _ = this;
                var active = _.active;
                var params = {
                    status: status,
                    get_error_status: get_error_status || null,
                    begin: _.begin[active] * _.limit,
                    limit: _.limit
                }
                API.getTickets(params).then(function (res) {
                    _.spinShow = false

                    if (res.data.result) {
                        _.renderData(res.data.issues)
                    } else {
                        UTILS.blToast(res.data.msg)
                    }
                }).catch(function () {
                    _.spinShow = false
                    UTILS.blToast(_.GLOBAL.sysErrMsg)
                })
            },
            // tab切换
            clickTab(type) {
                this.active = type
                let status = 'acknowledged';
                var get_error_status = null
                if (type == 'pending') {
                    status = 'acknowledged'
                } else if (type == 'finished') {
                    status = 'confirmed'
                } else {
                    get_error_status = true
                }
                this.getTickets(status, get_error_status)
            },
            aiDebug(row) {
                window.console.log(row)
                this.$router.push({
                    path: '/abnormal',
                    query: {
                        account_id: row.operate_account
                    }
                })
            },
            renderData(data) {
                var active = this.active;
                var dt = []
                for (let i = 0; i < data.length; i++) {
                    let dti = data[i];
                    let dsc = dti.description
                    let tagName = '';
                    let tagColor = '';
                    let hasVideo = false;
                    let hasImg = false;
                    // tag start
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
                    // tag end

                    var tb_item = {
                        title: {
                            task_id: dti.task_id,
                            ticket_id: dti.ticket_id,
                            title: dti.summary,
                            url: dsc.article_url,
                            tag: 'top',
                            tagName: tagName,
                            tagColor: tagColor,
                            hasImg: hasImg,
                            hasVideo: hasVideo,
                            interactive_type: dti.custom_fields_obj.interactive_type,
                            author: dti.creator.name,
                            time: UTILS.getDateDiff(dti.task_create_at * 1000),
                            error_status: dti.custom_fields_obj.error_status || null,
                            operate_account: dti.custom_fields_obj.operate_account || null,
                        },
                    }
                    if (active == 'abnormal') {
                        tb_item.hd = {
                            name: '去评论',
                            related_info: dti.steps_to_reproduce
                        }
                    }
                    if (active == 'pending') {
                        tb_item.hd = {
                            exp: UTILS.getDateDiff(dti.resolved_at * 1000, 2),
                            related_info: dti.steps_to_reproduce

                        }
                    }
                    if (active == 'finished') {
                        tb_item.exp = UTILS.getDateDiff(dti.confirmed_at * 1000, 2)
                    }
                    dt.push(tb_item)
                }
                this[active + 'Tb'] = dt

            },
            formatDate(date) {
                const y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                return y + '-' + m + '-' + d;
            },
            changePage(num) {
                window.console.log(num)
                var active = this.active
                this.begin[active] = num - 1
                let status = 'acknowledged';
                var get_error_status = null
                if (active == 'pending') {
                    status = 'acknowledged'
                } else if (active == 'finished') {
                    status = 'confirmed'
                } else {
                    get_error_status = true
                }
                this.getTickets(status, get_error_status)
            },
            toComment(art) {
                var _ = this;
                window.console.log(art)
                var params2 = new URLSearchParams()
                params2.append('issue_id', art.ticket_id)
                params2.append('interactive_type', art.interactive_type)
                API.taskResolved(params2).then(function (res2) {
                    if (res2.data.result) {
                        if (_.active == 'abnormal') {
                            _.getTicketsCount('acknowledged', true, 'abnormal');
                            _.getTickets('acknowledged', true);
                            _.getTicketsCount('acknowledged', false, 'pending');
                        } else {
                            _.getTicketsCount('acknowledged', false, 'pending');
                            _.getTickets('acknowledged', null)

                        }
                        window.open(art.url)
                    }
                }).catch(function () {

                })

            },
        },
        created() {
            var _ = this;
            _.getTicketsCount('acknowledged', true, 'abnormal');
            _.getTicketsCount('acknowledged', false, 'pending');
            _.getTicketsCount('confirmed', false, 'finished')
            _.getTickets('acknowledged', true);


        },
        mounted() {
            var _ = this;
        },
        watch: {
            clickRefresh() {
                return this.$store.state.is_refresh
            }
        },
        computed: {
            clickRefresh() {
                var _ = this;
                var active = _.active
                if (active == 'abnormal') {
                    _.getTicketsCount('acknowledged', true, 'abnormal');
                } else if (active == 'pending') {
                    _.getTicketsCount('acknowledged', false, 'pending');
                } else if (active == 'finished') {
                    _.getTicketsCount('confirmed', false, 'finished')
                }
                _.spinShow = true
                _.clickTab(active)
                window.console.log(_.$store.state.is_refresh)
            }
        },
    }
</script>

<style scoped>
    .finished-box {
        height: 100%;
        background: #fff;
        position: relative;
    }

    .all-total-box {
        position: absolute;
        top: 18px;
        right: 20px;
        z-index: 2;
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        text-align: right;
    }

    .task-hd {
        background-color: #fff;
        border-bottom: 1px solid #DCDFE6;
    }

    .task-hd-item:first-of-type {
        border-left: none;

        cursor: default;
    }

    .task-hd-item {
        border-left: 1px solid #DCDFE6;
        box-sizing: border-box;
        width: 25%;
        text-align: center;
        padding: 20px;
        /*border-bottom: 8px solid #fff;*/
        cursor: pointer;
        position: relative;
    }

    .task-hd-item.active {
        background: #EEF3F9;
        border-left: none;
        margin-right: -1px;
        z-index: 11;
    }

    .task-hd-item.active:after {
        content: '';
        background: #1989FA;
        height: 8px;
        width: 100%;
        display: block;
        position: absolute;
        left: 0;
        bottom: 0;
    }

    .task-hd-item-name {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        text-align: center;
    }

    .task-hd-item-count {
        font-family: Helvetica;
        font-size: 32px;
        color: #000000;
        text-align: center;
    }

    .article-title {
        color: #2E82FF;
    }

    .task-hd-item-icon {
        margin: -20px auto;
    }

    .task-hd-item-icon .iconfont {
        font-size: 45px;
    }

    .blue-ico {
        color: #1989FA;
    }

    .red-ico {
        color: #F56C6C;
    }

    .orange-ico {
        color: #F19552;
    }

    .green-ico {
        color: #67C23A;
    }

    .tips-text {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #666666;
        text-align: right;
    }

    .pending-hd-box {
        flex-direction: column;
        justify-content: space-between;
        min-height: 70px;
    }
</style>
