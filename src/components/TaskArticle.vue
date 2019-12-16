<template>
    <div>
        <a v-if="!is_unfinished" target="_blank" class="wline2 t-title" :href="subItem.url"><Tag color="warning" :class="subItem.tagColor" v-if="subItem.tagName">{{subItem.tagName}}</Tag>{{ subItem.title }}
            <i v-if="subItem.hasImg" class="iconfont has-media-ico" :class="imgIco[currPlat]"></i>
            <i v-if="subItem.hasVideo" class="iconfont  has-media-ico" :class="videoIco[currPlat]"></i>
        </a>
        <div v-if="is_unfinished"  class="wline2 t-title"><Tag color="warning" :class="subItem.tagColor" v-if="subItem.tagName">{{subItem.tagName}}</Tag>{{ subItem.title }}
            <i v-if="subItem.hasImg" class="iconfont has-media-ico" :class="imgIco[currPlat]"></i>
            <i v-if="subItem.hasVideo" class="iconfont  has-media-ico" :class="videoIco[currPlat]"></i>
        </div>
        <div class="td-bottom">
            <span class="td-author">{{subItem.author}} {{subItem.time}}创建</span>
        </div>
    </div>
</template>

<script>
    import * as UTILS from '../api/utils'
    export default {
        name: "TaskArticle",
        props: {
            item:Object
        },
        computed: {
            subItem() {
                var _ = this;
                var item = _.item;
                var plat = UTILS.getStore('currPlat').platform;
                _.currPlat = plat
                return item
            }
        },
        data() {
            return {
                is_unfinished: false,
                currPlat: '',
                imgIco: {
                    autohome: 'iconqyyx_picture',
                    qq: 'iconmt_picture_',
                    sina: 'iconmt_picture_1',
                    weibo: 'iconmt_picture_2',
                },
                videoIco : {
                    autohome: 'iconqyyx_video',
                    qq: 'iconmt_video_2',
                    sina: 'iconmt_video_',
                    weibo: 'iconmt_video_1',
                }
            }
        },
        mounted() {
            if(this.$route.name == 'unfinished') {
                this.is_unfinished = true
            }

        }
    }
</script>

<style scoped>
    .td-bottom {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #999999;
        margin-top: 6px;
    }
    .td-author {
        margin-right: 38px;
    }
    .t-title {
        font-family: PingFang-SC-Medium;
        font-size: 16px;
        color: #333333;
        max-width: 630px;
        line-height: 20px;
        min-height: 44px;
    }
    .has-media-ico {
        font-size: 22px;
        color: #1989FA;
        margin-left: 8px;
        position: relative;
        top: 3px;
        line-height: 20px;
    }
    .bg-orange {
        background: #FF5936;
    }
    .bg-blue {
        background: #386ED3;
    }

</style>
