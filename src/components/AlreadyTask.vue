<template>
  <div  class="already-task-tb">
    <Table :data="abnormalTb" :columns="abnormalTbColumns">
      <template slot-scope="{ row }" slot="title">
        <a target="_blank" class="wline1" :href="row.title.url">{{ row.title.title }}</a>
      </template>
      <template slot-scope="{ row, index }" slot="hd">
        <span type="primary" size="small" style="margin-right: 5px" @click="show(index)">{{row.hd}}</span>
      </template>
    </Table>
    <div style="padding: 10px;overflow: hidden;background: #fff">
      <div style="float: right;">
        <Page :total="100" :current="1" @on-change="changePage"></Page>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "AlreadyTask",
      data(){
        return{
          hdModal: false, // 操作提示模态框
          abnormalTb: this.mockTableData1(),
          abnormalTbColumns: [
            {
              title: '任务ID',
              key: 'id',
              width: 140
            },
            {
              title: '帖子标题',
              key: 'title',
              slot:'title'
            },
            {
              title: '口径',
              key: 'statement',
              width: 200

            },

          ],
        }
      },
      methods: {
        showHdmodal() {
          this.hdModal = true
        },
        closeHdModal() {
          this.hdModal = false
        },
        mockTableData1 () {
          let data = [];
          for (let i = 0; i < 10; i++) {
            data.push({
              id: 'Business' + Math.floor(Math.random () * 100 + 1),
              title: {
                title:'【比亚迪e2论坛 】 E2配置表（最新消息）最迟到8月…',
                url:'http://www.baidu.com'
              },
              portrayal: 123,
              statement: i,
            })
          }
          return data;
        },
        changePage (e) {
          window.console.log(e)
          // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
          // this.tableData1 = this.mockTableData1();
        }
      }
    }
</script>

<style scoped>
  .already-task-tb {
    border-top: 1px solid #dbdbdb;
  }

</style>
