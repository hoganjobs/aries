

<template>
  <div>
    <div v-if="!is_relation" class="chat-item dpflex" :class="isCurrent ? 'current' : ''" >
      <div class="name">{{item.name}}</div>
      <div class='c-right'>
        <i class="iconfont iconfs-lianjie t-ico"  @click="showRelation"></i>
      </div>
    </div>

      <Submenu :name="item.platform" v-if="is_relation" >
        <template slot="title">
          {{item.name}}
        </template>
        <MenuItem :name="item.platform+'-unfinished'" @click.native="toTask(item,'unfinished')">待做任务</MenuItem>
        <MenuItem :name="item.platform+'-finished'" @click.native="toTask(item,'finished')">已做任务</MenuItem>
      </Submenu>
    <Modal v-model="rlModal" :title="rlModalTitle" width="640px">
      <div >
        <div class="md-title">关联{{item.name}}账号</div>
        <div class="rl-body">
          <div class="rl-top">
            关联步骤：
          </div>
          <div class="rl-desc-item">
            1.点击
            <Button @click="toUserHome" class="primary-line-btn">去{{item.name}}个人主页</Button> ，若未登录请先登录账号
          </div>
          <div class="rl-desc-item">
            2.从浏览器地址栏中复制地址粘贴到上方，点击“关联帐号”即可。
          </div>
          <div class="rl-eg">链接地址类似：https://i.autohome.com.cn/132132141</div>
          <div class="rl-link-box dpflex">
            <div class="rl-link-l">链接</div>
<!--            <input class="rl-link-r"  >-->
            <Input :class="'rl-link-r no-submit-btn'" v-model="linkValue" placeholder="" clearable />

          </div>
        </div>
      </div>
      <div slot="footer">
        <Button class="rl-btn" size="large" type="primary" @click="bind">关联帐号</Button>
      </div>
    </Modal>
  </div>

</template>

<script>
  import * as API from '../api/api'
  import * as UTILS from '../api/utils'
  import {Menu, Submenu, MenuItem} from 'view-design'
  export default {
    name: 'ChatItem',
    components:{
      [Menu.name]:Menu,
      [Submenu.name]:Submenu,
      [MenuItem.name]:MenuItem,
    },
    props: {
      id: String,
      item:Object,
      activeName:String
    },
    data() {
      return {
        menuActive:'',
        linkValue:'',
        df_avatar: require('../static/img/default_hd.jpg'),
        info: {},
        rlModal: false,
        rlModalTitle: ' ',
        is_relation: false
      }
    },
    methods: {
      // 绑定第三方账号
      bind() {
        var _ = this;
        var val = _.linkValue;
        if(val == '') {
          _.$Message.info('链接不能为空')
        }else {
          var currPlat = _.$store.state.currentPlatform;
          var open_type = currPlat.platform;
          var params = new URLSearchParams()
          params.append('open_type', open_type);
          params.append('bind_url',val);
          API.bindOthers(params).then(function (res) {
            var _d = res.data
            _.rlModal = false
            _.$Message.info('关联成功')
            currPlat.user_name = _d.oauth_user_info.name
            currPlat.user_avatar = _d.oauth_user_info.avatar
            currPlat.is_relation = true
            let user = UTILS.getStore('userInfo');
            user.bind_account[open_type] = currPlat
            UTILS.setStore('userInfo',user)
            UTILS.setStore('currPlat',currPlat)
            _.$store.commit('changePlatform',currPlat)
            _.$router.push({
              path:'/unfinished',
              query: {
                id:open_type
              }
            })
          }).catch(function () {

          })
        }

      },
      toUserHome() {
        window.open('https://i.autohome.com.cn/172711065#pvareaid=3311670')
      },
      showRelation() {
        this.rlModal = true
      },
      get_info() {
        window.console.log('render menu')
        this.info = this.$store.state.currentPlatform
        if(this.item.platform == this.info.platform && this.info.is_relation) {
          this.is_relation = true
          let path = this.$route.name;
          let plat = this.$route.query.id;

          if(plat == this.info.platform) {
            this.menuActive = plat + '-' + path
          }
        }
      },
      toTask(item,type) {
        var path = '/'+ type;
        var cur_plat = this.$store.state.userInfo.bind_account[item.platform];
        window.console.log(this.$store.state.userInfo)
        cur_plat.is_relation = true;

        this.$store.commit('changePlatform',cur_plat)
        if(path != this.$route.path ) {
          this.$router.push({
            path: path,
            query: {
              id: this.item.platform
            }
          })
        }

      },
      toFinished() {
        this.$router.push({
          path:'/finished',
          query: {
            id: this.item.platform
          }
        })
      }
    },
    watch:{
      activeName(val){
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
  .rl-btn {
    display: block;
    margin: 0 auto 28px;
  }
</style>
