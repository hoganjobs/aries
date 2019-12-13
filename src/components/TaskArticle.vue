<template>
    <div>
        <a v-if="!is_unfinished" target="_blank" class="wline2 t-title" :href="item.url"><Tag color="warning" :class="item.tagColor" v-if="item.tagName">{{item.tagName}}</Tag>{{ item.title }}
            <i v-if="item.hasImg" class="iconfont iconqyyx_picture has-media-ico"></i>
            <i v-if="item.hasVideo" class="iconfont iconqyyx_video has-media-ico"></i>
        </a>
        <div v-if="is_unfinished"  class="wline2 t-title"><Tag color="warning" :class="item.tagColor" v-if="item.tagName">{{item.tagName}}</Tag>{{ item.title }}
            <i v-if="item.hasImg" class="iconfont iconqyyx_picture has-media-ico"></i>
            <i v-if="item.hasVideo" class="iconfont iconqyyx_video has-media-ico"></i>
        </div>
        <div class="td-bottom">
            <span class="td-author">{{item.author}} {{item.time}}创建</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TaskArticle",
        props: {
            item:Object
        },
        data() {
            return {
                is_unfinished: false,
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
