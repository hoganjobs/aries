<template>
  <div class="task-box">
    <div class="main">
      <div class="main-inner">
        <div class="sd">
          <div class="m-hd">
            <div class="header">
              <div class="avatar" ><img :src="df_avatar" >
              </div>
              <div class="info">
                <div class="name">邓果果</div>
                <div class="attend_name">网页分身1号</div>
              </div>
            </div>

          </div>
          <div class="m-lst-box topnav_box">
            <div class="m-lst"  >
              <ChatItem :id="'all1'" @click.native="tapItem('all1')"></ChatItem>
              <ChatItem :id="'all2'" @click.native="tapItem('all2')"></ChatItem>
              <ChatItem :id="'all3'" @click.native="tapItem"></ChatItem>
            </div>
          </div>
        </div>
        <div class="chat-box">
          <div  class="chat-area">
            <div  class="box-hd">
              <div  class="title">关联账号</div>
            </div>
            <div  class="chat-bd topnav_box"><!---->

              <!-- 待做任务             -->
              <Unfinished v-if="currPage == 'unfinished'"></Unfinished>
              <!-- 待做任务             -->
              <div v-if="currPage == 'finished'" class="msg-item msg-item-right clearfix">
                <div  class="nt-item">
                  <div  class="content">1qwe&nbsp;</div>
                  <img  src="/static/img/default_hd.df7d40a.jpg" class="image"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
  import ChatItem from '../components/ChatItem'
  import Unfinished from '../pages/Unfinished'
  export default {
    name: "Task",
    components:{
      ChatItem,
      Unfinished,
    },
    data(){
      return {
        df_avatar: require('../static/img/default_hd.jpg'),
        currPage: ''
      }
    },
    methods: {
      tapItem(id) {
        console.log(this.$store.state.currentPage)
        if(id == 'all1') {
          this.$store.commit('changePage', 'unfinished')

        }else {
          this.$store.commit('changePage', 'finished')

        }
        this.currPage = this.$store.state.currentPage
        console.log(this.$store.state.currentPage)

      }
    },
    created() {
      this.currPage = this.$store.state.currentPage
    }
  }
</script>
<style scoped lang="less">
@import "../static/css/app";
@import "../static/css/chat_area";
.task-box {
  width: 100vw;
  height: 100vh;
}
</style>
