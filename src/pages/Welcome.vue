<template>
    <div class="welcome-box">
        <div class="tips-box">
            <div class="tips1">未关联{{ curPlat.name }}帐号！</div>
            <div class="tips2">
                请点击“
                <!--          <Icon class="t-ico" type="ios-at" />-->
                <i class="iconfont iconfs-connect t-ico"></i>
                ”开始关联吧！
            </div>
        </div>
        <img class="welcome-bg" :src="welcomeBg" alt="" />
    </div>
</template>

<script>
export default {
    name: "Welcome",
    data() {
        return {
            rlModal: false,
            curPlat: this.$store.state.currentPlatform,
            welcomeBg: require("../static/img/chahua.png")
        };
    },
    watch: {
        changePlatform() {
            return this.$store.state.currentPlatform;
        }
    },
    computed: {
        changePlatform() {
            console.log(this.$store.state.currentPlatform);
            this.curPlat = this.$store.state.currentPlatform;
        }
    },
    mounted() {
        console.log(this.$store.state.currentPlatform);
        var id = this.$route.query.platform;
        if (id) {
            var list = this.$store.state.platformList;
            for (let i = 0; i < list.length; i++) {
                if (list[i].id == id) {
                    var cur_plat = list[i];
                    this.$store.commit("changePlatform", cur_plat);
                    if (cur_plat.is_relation) {
                        this.$router.push({
                            path: "/unfinished",
                            query: {
                                id: id
                            }
                        });
                    }
                }
            }
        }
    },
    created() {}
};
</script>

<style scoped>
.tips-box {
    margin-top: 151px;
    text-align: center;
}

.tips1 {
    font-family: PingFang-SC-Medium;
    font-size: 24px;
    color: #333333;
    text-align: center;
    margin-bottom: 22px;
    font-weight: bold;
}

.tips2 {
    font-family: PingFang-SC-Regular;
    font-size: 20px;
    color: #333333;
    text-align: center;
}

.t-ico {
    font-size: 24px;
    color: #999;
}

.welcome-bg {
    display: block;
    margin: 66px auto 20px;
}
</style>