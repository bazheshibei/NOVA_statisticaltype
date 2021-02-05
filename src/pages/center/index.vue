
<!-- 自定义统计 -->

<template>
  <div class="pageBox" v-on:scroll="pageScroll" ref="page">

    <!-- 搜索模块 -->
    <div ref="search" style="margin-bottom: 5px;">
      <com-search @recount="recount"></com-search>
    </div>

    <!-- 表格模块 -->
    <div class="ComTable" ref="table">
      <com-table :tableHeight="tableHeight" v-for="(item, index) in tableSignArr" :key="'comTable_' + index" v-if="index === tableSignArr.length - 1"></com-table>
    </div>

    <!-- 分页 -->
    <div class="paginationBox" ref="pagination">
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
import Store from '@/store'

/* 回车：查询 */
document.addEventListener('keyup', (event) => {
  if (String(event.keyCode) === '13') {
    Store.dispatch('search', { operationType: 'search', isLoading: true })
  }
})

export default {
  components: { ComSearch, ComTable, ComAdvancedQuery },
  data() {
    return {
      tableHeight: 0, // 表格高度
      scrollTop: 0
    }
  },
  created() {
    /** 请求：指标 **/
    this.$store.dispatch('A_getCode', { that: this })
  },
  computed: {
    ...mapState(['tableSignArr', 'pagenum', 'rownum', 'pageCount']),
    ...mapGetters(['tableSign'])
  },
  methods: {
    /**
     * [重新计算表格高度]
     */
    recount() {
      this._countHeight()
    },
    /**
     * [分页切换]
     * @param {[String]} name 属性名
     * @param {[Int]}    val  属性值
     */
    pageChange(name, val) {
      /** 保存数据 **/
      this.$store.commit('saveData', { name, obj: val })
      if (name === 'rownum') {
        this.$store.commit('saveData', { name: 'pagenum', obj: 1 })
      }
      /** 查询 **/
      this.$store.dispatch('search', { operationType: 'search', isLoading: true })
    },
    /**
     * [页面滚动事件]
     */
    pageScroll(event) {
      const newNum = event.target.scrollTop
      const oldNum = this.scrollTop
      if (Math.abs(newNum - oldNum) < 300) {
        this.scrollTop = event.target.scrollTop
        this.$refs.page.scrollTop = newNum
      } else {
        this.$refs.page.scrollTop = oldNum
      }
    },
    /**
     * [计算：表格高度]
     */
    _countHeight() {
      const that = this
      let i = 0
      const timer = setInterval(function () {
        if (Object.keys(that.$refs).length) {
          const { page, search, pagination } = that.$refs
          if (page.clientHeight && search.clientHeight && pagination.clientHeight) {
            const num = page.clientHeight - search.clientHeight - pagination.clientHeight - 10
            that.tableHeight = num
            clearInterval(timer)
          }
        }
        if (i > 100) {
          clearInterval(timer)
        }
        i++
      }, 100)
    }
    //
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
  border-top: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  flex: 1;
}
td >.cell {
  display: flex;
  align-items: flex-start;
}
/*** 分页 ***/
.paginationBox {
  margin: 2px 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
