<template>
    <div>
        <div v-if="!is_relation" class="chat-item dpflex" :class="isCurrent ? 'current' : ''">
            <div class="name">{{item.name}}</div>
            <div class='c-right'>
                <i class="iconfont iconfs-connect t-ico" @click="showRelation"></i>
            </div>
        </div>

        <Submenu :name="item.platform" v-if="is_relation">
            <template slot="title">
                {{item.name}}
            </template>
            <MenuItem :name="item.platform+'-unfinished'" @click.native="toTask(item,'unfinished')">待做任务</MenuItem>
            <MenuItem :name="item.platform+'-finished'" @click.native="toTask(item,'finished')">已做任务</MenuItem>
        </Submenu>
        <ModalUrlBind :syncModalClose.sync="rlModal" :item="item"></ModalUrlBind>
        <ModalActBind :syncModalClose.sync="rlModalB" :item="item"></ModalActBind>
    </div>

</template>

<script>
    import * as API from '../api/api'
    import * as UTILS from '../api/utils'
    import bus from  '../api/bus'
    import merge from 'webpack-merge'
    import {Menu, Submenu, MenuItem} from 'view-design'
    import ModalUrlBind from "./ModalUrlBind";
    import ModalActBind from "./ModalActBind";

    export default {
        name: 'ChatItem',
        components: {
            [Menu.name]: Menu,
            [Submenu.name]: Submenu,
            [MenuItem.name]: MenuItem,
            ModalUrlBind,
            ModalActBind
        },
        props: {
            id: String,
            item: Object,
            activeName: String
        },
        data() {
            return {
                menuActive: '',
                info: {},
                rlModal: false,
                rlModalB: false,
                is_relation: false,
            }
        },
        methods: {
            showRelation() {
                console.log("####")
                if (this.item.platform == "autohome" || this.item.platform == "weibo") {
                    this.rlModal = true;
                } else {
                    this.rlModalB = true;
                }
            },
            get_info() {
                window.console.log('render menu')
                this.info = this.$store.state.currentPlatform
                if(this.item.is_relation) {
                    this.is_relation = true
                    if (this.item.platform == this.info.platform && this.info.is_relation) {
                        let path = this.$route.name;
                        let plat = this.$route.query.id;
                        if (plat == this.info.platform) {
                            this.menuActive = plat + '-' + path
                        }
                    }
                }else {
                    this.is_relation = false
                }
            },
            toTask(item, type) {
                this.toTaskList(item, type)
            },
            toTaskList(item,page) {
                var refresh = 'refresh' +  (new Date()).valueOf()
                var _ = this;
                this.$store.commit('changePlatform', item)
                UTILS.setStore('currPlat', item)
                this.$emit('clickTaskMenu', 'change')
                bus.$emit(page+'MenuClick',refresh)
                if(_.$route.name != page) {
                    this.$router.push({
                        path: '/'+page,
                        query: {
                            id: this.item.platform
                        }
                    })
                } else {
                    if (this.$route.query.id !== this.item.platform) {
                        this.$router.replace({
                            query: merge(this.$route.query,{'id':this.item.platform})
                        })
                    }
                    bus.$emit(page+'Refresh',refresh);
                }
            }
        },
        watch: {
            activeName(val) {
            }
        },
        computed: {
            // 是否当前
            isCurrent() {
                return this.$store.state.currentPlatform.platform == this.item.platform;
            },
            // 是否显示消息小红点
            isHasNewMsg() {
                return this.$store.state.noRead.includes(String(this.id));
            }
        },
        created() {
            this.get_info()
        }
    }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
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

    .current {
        background-color: #3a3f45;
    }

    .chat-item {
        display: flex;
        padding: 0 18px 0 40px;
        cursor: pointer;
        justify-content: space-between;
        border-bottom: 1px solid #252A2E;
        height: 48px;
        align-items: center;

        .avatar {
            width: 50px;

            img {
                width: 40px;
                height: 40px;
                border-radius: 3px;
            }
        }

        .new-msg {
            position: relative;

            &:after {
                content: '';
                border: 5px solid red;
                position: absolute;
                top: -5px;
                right: 5px;
                border-radius: 50%;
            }
        }

        .name {
            font-family: PingFang-SC-Regular;
            font-size: 16px;
            line-height: 1;
            color: #FFFFFF;
            &:extend(.text);
        }

        .c-right {
            opacity: 0.5;
            font-family: PingFang-SC-Regular;
            font-size: 14px;
            color: #FFFFFF;
            text-align: center;
        }

        .t-ico {
            font-size: 24px;
        }
    }

    .rl-body {
        width: 480px;
        margin: 0 auto;
    }

    .rl-top {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #333333;
        letter-spacing: 0;
        line-height: 36px;
    }

    .rl-desc-item {
        font-family: PingFang-SC-Regular;
        font-size: 16px;
        color: #2A2A2A;
        letter-spacing: 0;
        line-height: 36px;
    }

    .rl-eg {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #999999;
        letter-spacing: -0.88px;
        margin: 24px 0 28px;
    }

    .rl-link-box {
        align-items: center;
    }

    .rl-link-l {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        letter-spacing: -0.88px;
        margin-right: 12px;
    }

    .rl-link-r {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        letter-spacing: -0.88px;
        height: 40px;
        flex: 1;
        border-radius: 4px;
    }

    .rl-link-r input {
        height: 40px;
    }

    .rl-btn.middle {
        display: block;
        margin: 0 auto 28px;
    }
    .rl-header {
        padding-top: 10px;
        font-size: 18px;
        color: #333333;
    }
    .rl-footer {
        text-align: right;
    }
    .loading-tips {
        font-family: PingFang-SC-Regular;
        font-size: 18px;
        color: #4A4A4A;
        letter-spacing: -2.08px;
        text-align: center;
    }
    .restart-tips {
        font-family: PingFang-SC-Regular;
        font-size: 18px;
        color: #F86900;
        letter-spacing: -2.08px;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 20px;
    }
    .ivu-tag-size-large {
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
        margin-right: 13px;
    }
    .ivu-btn.ivu-btn-default.rl-btn {
        color: #333;
        border-color: #dcdfe6;
    }
    .rl-tag {
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
    .rl-tag.active {
        color: #2d8cf0;
        border: 1px solid #2d8cf0;
        background-color: #fff;
    }
    .rl-restart {
        text-align: center;
    }
</style>
