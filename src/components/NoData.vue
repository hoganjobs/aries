<template>
    <div class="no-data-box dpflex">
        <img :src="noDataImg" alt="">
        <div class="no-data-text">暂无数据</div>
    </div>

</template>

<script>
    export default {
        name: "NoData",
        data() {
            return {
                noDataImg: require('../static/img/no_data.png')
            }
        }
    }
</script>

<style scoped>
    .no-data-box {
        width: 100%;
        height: 560px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .no-data-text {
        font-size: 16px;
        color: #999;
    }

</style>
