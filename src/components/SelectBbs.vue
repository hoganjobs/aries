<template>
    <div class="bbs-filter-btn-box" @click="showCheckBbs" v-if="isCkBbs">
        <div class="bbs-filter-btn">{{bbs.bbs_name}}
        </div>
        <i class="select-arrow"></i>
        <Modal v-model="checkBbsMd" title="选择论坛" width="675px"
               @on-ok="submit_bbs_filter"
               >
            <div>
<!--                <div class="md-title">选择论坛</div>-->
                <div class="rl-body">
                    <span :class="bbs.bbs_id == '' ? 'bl-tag active': 'bl-tag'"
                          @click="bbsCheck({bbs_id:'',bbs_name:'全部论坛'})">全部论坛</span>
                    <span v-for="(item, index) in bbsList" :key="index"
                          :class="item.bbs_id == bbs.bbs_id ? 'bl-tag active': 'bl-tag'" @click="bbsCheck(item)">{{item.bbs_name}}</span>

                </div>
            </div>
<!--            <div slot="footer">-->
<!--                <div class="off-rl-footer-box">-->
<!--                    <Button class="rl-btn primary-line-btn" size="large" >取消</Button>-->
<!--                    <Button class="rl-btn" size="large"  type="primary" @click="submit_bbs_filter">确定-->
<!--                    </Button>-->
<!--                </div>-->
<!--            </div>-->
        </Modal>
    </div>


</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import bus from '../api/bus'

    export default {
        name: "SelectBbs",
        data() {
            return {
                checkBbsMd: false,
                isCkBbs: false,
                bbs: {
                    bbs_id: '',
                    bbs_name: '全部论坛'
                },
                bbsList: []
            }
        },
        methods: {
            submit_bbs_filter() {
                this.checkBbsMd = false
                this.refreshData()
            },
            refreshData() {
                var router_name = this.$route.name;
                window.console.log(router_name)
                UTILS.setStore('bbs',this.bbs)
                bus.$emit(router_name+'Refresh',this.bbs.bbs_id)
            },
            showCheckBbs() {
                this.optionsList();
                this.checkBbsMd = true
            },
            optionsList() {
                var _ = this;
                var params = {
                    media_platform: 'autohome',
                }
                API.optionsList(params).then(function (res) {
                    if (res.data.result) {
                        _.bbsList = res.data.bbs_options
                        // _.bbsList = res.data.options
                    }
                }).catch(function () {
                })
            },
            bbsCheck(item) {
                window.console.log(item)

                this.bbs = item;
            },
        },
        mounted() {
            let c_plat = UTILS.getStore('currPlat');
            if(c_plat.is_relation && c_plat.platform == 'autohome') {
                this.isCkBbs = true
                this.optionsList();
            }
        },
        created() {
            var _ = this;
            let bbs = UTILS.getStore('bbs')
            if(bbs) {
                _.bbs = bbs
            }
        }
    }
</script>

<style scoped>
    .bbs-filter-btn-box {
        height: 44px;
        position: absolute;
        left: 0;
        padding: 10px 20px;
        font-family: PingFang-SC-Medium;
        font-size: 16px;
        color: #333333;
        cursor: pointer;
    }

    .bbs-filter-btn-box .select-arrow {
        position: absolute;
        top: 50%;
        right: 8px;
        margin-top: -5px;
        border: 3px solid;
        border-color: transparent transparent currentColor currentColor;
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg);
        opacity: .8;
        content: '';
    }
    .rl-body {
        /*min-height: 320px;*/
    }
    .bl-tag {
        padding: 6px 16px;
        background: #F4F4F5;
        border: 1px solid #E9E9EB;
        border-radius: 4px;
        font-size: 14px;
        color: #666666;
        text-align: center;
        margin-left: 12px;
        margin-bottom: 12px;
        display: inline-block;
        cursor: pointer;
    }
    .bl-tag.active {
        border: 1px solid #1989FA;
        color: #1989FA;
    }
</style>
