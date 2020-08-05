
<!-- 自定义统计 -->

<template>
  <div class="pageBox" v-on:scroll="pageScroll" ref="page">

    <!-- 搜索模块 -->
    <com-search></com-search>

    <!-- 表格模块 -->
    <com-table class="ComTable"
      v-for="(item, index) in tableSignArr" :key="'comTable_' + index"
      v-if="index === tableSignArr.length - 1"
    ></com-table>

    <!-- 分页 -->
    <div class="paginationBox">
      <el-pagination class="comPagination" :page-size="rownum" :page-sizes="[10, 20, 30, 50, 100]" :total="pageCount" :current-page="pagenum"
        layout="prev, pager, next, total, jumper, sizes" prev-text="上一页" next-text="下一页"
        @size-change="pageChange('rownum', $event)" @current-change="pageChange('pagenum', $event)"
      >
      </el-pagination>
    </div>
    <!-- /分页 -->

    <p style="display: none;">
      {{tableSign}}
      用于触发统计 tableSignArr
    </p>

    <!-- 高级查询 -->
    <com-advancedQuery></com-advancedQuery>
    <!-- /高级查询 -->

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ComSearch from './components/search' //               搜索模块
import ComTable from './components/table' //                 表格模块
import ComAdvancedQuery from './components/advancedQuery' // 高级查询
export default {
  components: { ComSearch, ComTable, ComAdvancedQuery },
  data() {
    return {
      scrollTop: 0
    }
  },
  created() {
    /** 请求：指标 **/
    this.$store.dispatch('A_getCode')
    /** 请求：数据 **/
    // this.$store.dispatch('A_getData')
  },
  computed: {
    ...mapState(['tableSignArr', 'pagenum', 'rownum', 'pageCount']),
    ...mapGetters(['tableSign'])
  },
  methods: {
    /**
     * [分页切换]
     * @param {[String]} name 属性名
     * @param {[Int]}    val  属性值
     */
    pageChange(name, val) {
      /* 重置：合计 */
      // this.$store.commit('saveData', { name: 'countData', obj: {} })
      /** 保存数据 **/
      this.$store.commit('saveData', { name, obj: val })
      /** 查询 / 导出 **/
      this.$store.dispatch('search', { operationType: 'search', isLoading: true })
    },
    /**
     * [页面滚动事件]
     */
    pageScroll(event) {
      const newNum = event.target.scrollTop
      const oldNum = this.scrollTop
      // console.log('newNum ----- ', newNum)
      // console.log('oldNum ----- ', oldNum)
      // console.log('绝对值 ----- ', Math.abs(newNum - oldNum))
      if (Math.abs(newNum - oldNum) < 300) {
        this.scrollTop = event.target.scrollTop
        this.$refs.page.scrollTop = newNum
        // console.log(' ---------- 300 ---------- ')
      } else {
        this.$refs.page.scrollTop = oldNum
        // console.log(' ---------- 999 ---------- ')
      }
      // console.log('页面滚动事件 ----- ', event.target.scrollTop)
    },
    /**
     * [兼容IE11：数组includes]
     * @param  {[String]}  str 关键字
     * @param  {[Array]}   arr 数组
     * @return {[Boolean]}     true || false
     */
    arrIncludes(str, arr) {
      let status = false
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === str) {
          status = true
        }
      }
      return status
    }
  }
}
</script>

<style scoped>
.pageBox {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 0;
}
/*** 表格模块 ***/
.ComTable {
  width: 100%;
  margin-top: 5px;
  border-top: 1px solid #EBEEF5;
  border-bottom: 1px solid #EBEEF5;
  flex: 1;
}
/*** 分页 ***/
.paginationBox {
  margin: 2px 15px;
  display: flex;
  justify-content: flex-end;
}
</style>

<style>
/*** 模块刷新 ***/
.f5 {
  color: #909399;
  cursor: pointer;
  padding: 0 6px;
}

/*** 表格字体 ***/
.el-table {
  font-size: 12px !important;
}
.el-table thead {
  color: #000000 !important;
}
/*** 重置表头单元格 ***/
.el-table > div th, .el-table > div th > .cell {
  padding: 2px 0 !important;
  font-weight: 500;
}
.el-table > div th > .cell .thText {
  line-height: 14px;
  padding: 5px 10px;
}
th > .cell, th > .cell .thText {
  text-align: center;
}
/*** 表头输入内容 ***/
.thActive {
  color: #ffffff !important;
  /* color: #ffffff;
  background: #409EFF; */
}
/*** 单元格 ***/
td {
  padding: 0 !important;
}
.cell p {
  line-height: 16px !important;
  margin: 4px 0 !important;
}
td > .cell {
  text-align: center;
}

/*** 搜索 ***/
.el-popover {
  padding: 0px !important;
}
.el-popover > div > input {
  height: 26px;
  font-size: 12px !important;
  display: flex;
  align-items: center;
}
.el-popover > div > .el-input__suffix { /* input 中删除按钮 */
  margin-top: -6px;
}

/*** 分页 ***/
.comPagination {
  padding: 0;
}
.comPagination > .el-pagination__sizes { /* 总条数 */
  margin: 0 0 0 30px;
}
.comPagination > .el-pagination__sizes > .el-select > .el-input--suffix { /* 总条数 */
  margin-right: 0;
}

/*** 下拉框 ***/
.el-select-dropdown__item {
  height: 20px !important;
  font-size: 12px !important;
  line-height: 20px !important;
  padding: 0 10px !important;
}
</style>
