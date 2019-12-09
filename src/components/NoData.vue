<template>
    <div class="no-data-box dpflex">
        <img :src="noDataImg" alt="">
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
        height: 580px;
        align-items: center;
        justify-content: center;
    }

</style>
