<template>
  <div class="find-box">
    <div class="find-body">
      <div class="f-title">智能排查</div>
      <div class="text">需提供执行任务的汽车之家账号地址用于智能排查</div>
      <div class="search-box">
        <Input search enter-button="开始排查" clearable :placeholder="placeholder" @on-search="search" @search="search" @enter="search" @click="search"/>
      </div>
    </div>
    <div class="find-tips-box">
      <div class="rl-top">
        关联步骤：
      </div>
      <div class="rl-desc-item">
        1.点击
        <Button @click="toUserHome" class="primary-line-btn">去{{curPlat.name}}个人主页</Button> ，若未登录请先登录 “<span class="hd-btn"> {{curPlat.user.name}} </span>”  账号
      </div>
      <div class="rl-desc-item">
        2.从浏览器地址栏中复制地址粘贴到上方输入框即可，地址类似为：https://i.autohome.com.cn/132132141
      </div>

    </div>
  </div>
</template>

<script>
  export default {
    name: "Find",
    data(){
      return {
        placeholder: '粘贴汽车之家个人中心网页地址',
        curPlat:''
      }
    },
    methods: {
      search(val) {
        console.log(val)
        this.$router.push({
          path: '/abnormal'
        })
      },
      toUserHome() {
        window.open('https://i.autohome.com.cn/172711065#pvareaid=3311670')
      },
    },
    mounted() {
    },
    created() {
      this.curPlat = this.$store.state.currentPlatform
    }
  }
</script>

<style scoped>
  .find-body {
    background: #ffffff;
    padding: 22px 32px 36px 32px;
    margin-bottom: 20px;
  }
  .f-title {
    font-family: PingFang-SC-Medium;
    font-size: 24px;
    color: #333333;
    letter-spacing: -1.39px;
    text-align: center;
    margin-bottom: 20px;
  }
  .text {
    font-family: PingFang-SC-Regular;
    font-size: 14px;
    color: #333333;
  }
  .search-box {
    margin-top: 10px;
  }
  .find-tips-box {
    background: #fff;
    height: 485px;
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
    color: #666666;
    letter-spacing: 0;
    line-height: 36px;
    word-break: break-all;
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
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .rl-btn {
    display: block;
    margin: 0 auto 28px;
  }
  .find-tips-box {
    padding: 20px 32px;
  }
</style>
