<template>
    <div class="nop-box">
        <div class="tips-box">
            <div class="tips1">未找到关联平台</div>
            <div class="tips2">无</div>
        </div>
        <img class="nop-bg" :src="nopBg" alt="" />
    </div>
</template>

<script>
export default {
    name: "NoPlatform",
    data() {
        return {
            active: 0,
            nopBg: require("../static/img/no_page.png")
        };
    },
    mounted() {},
    created() {}
};
</script>

<style scoped>
.nop-box {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: absolute;
    top: 0;
}
.tips-box {
    margin-top: 151px;
    text-align: center;
}

.tips1 {
    font-family: PingFang-SC-Medium;
    font-size: 24px;
    color: #fff;
    text-align: center;
    margin-bottom: 22px;
    font-weight: bold;
}

.tips2 {
    font-family: PingFang-SC-Regular;
    font-size: 20px;
    color: #fff;
    text-align: center;
}

.t-ico {
    font-size: 24px;
    color: #999;
}

.nop-bg {
    display: block;
    margin: 66px auto 20px;
}
</style>