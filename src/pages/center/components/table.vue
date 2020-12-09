
<!-- 表格模块 -->

<template>
  <div class="tableBox">
<!-- {{searchLabel}} -->
    <el-table class="comTable" v-loading="isLoading" element-loading-text="请求数据中"
      :data="tableData" :height="tableHeight" size="mini" border :show-summary="true" :summary-method="summaryMethod"
      :row-style="rowStyle" :cell-style="cellStyle" :header-cell-style="headerStyle" :span-method="objectSpanMethod"
    >
      <el-table-column prop="custom_name" label="客户名称" fixed></el-table-column>
      <el-table-column prop="dress_type_name" label="服装品类" fixed></el-table-column>
      <el-table-column prop="custom_dress_series_name" label="系列名称" fixed></el-table-column>
      <el-table-column prop="style_name" label="款式名称" fixed></el-table-column>
      <el-table-column prop="dh_item_name" label="大货项目名称" fixed></el-table-column>

      <div v-for="(item, index) in selectArr" :key="item.word">
        <!-- 展示选中的表头 -->
        <div v-for="(val, key) in item.options[1].options" :key="val.label"
           v-if="arrIncludes(val.label, searchLabel[item.word])"
        >
          <el-table-column :label="val.label" min-width="100"
            :column-key="index + '^' + item.columnKey + '^' + item.word + '^' + val.value"
          >
            <template slot="header" slot-scope="scope">
              <el-popover placement="top" width="250" trigger="click">
                <el-input :ref="'input_' + index + '_' + key" clearable v-model="searchObj[val.value]" placeholder="多个查询空格分隔" @clear="clear(val.value)" @change="change(val.value, $event, item.word)"></el-input>
                <div class="thText" :class="searchObj[val.value] ? 'thActive' : ''" slot="reference" @click="tableHeaderClick(index, key)">
                  {{val.label}}<span>&nbsp;<i class="el-icon-search"></i></span>
                </div>
              </el-popover>
            </template>
            <template slot-scope="scope">
              <div class="ComTableCell">
                <span>{{scope.row[val.value]}}</span>
              </div>
            </template>
          </el-table-column>
        </div>
      </div>
    </el-table>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['tableHeight'],
  data() {
    return {
      topBottomStyle: {}, // 表头、合计样式
      contentStyle: {}, //   内容表格高度
      searchObj: {}, //      表头搜索
      countObj: {} //       合计
    }
  },
  computed: {
    ...mapState(['pagenum', 'rownum', 'pageCount', 'countData', 'isLoading', 'colorArr']),
    ...mapGetters(['tableData']),
    /**
     * [下拉框数据]
     */
    selectArr() {
      const arr = this.$store.state.selectArr
      if (arr.length) {
        console.log('arr ----- ', arr)
        return arr
      } else {
        return []
      }
    },
    /**
     * [选中的表头名称]
     */
    searchLabel() {
      const obj = this.$store.state.searchLabel || {}
      return Object.keys(obj) ? obj : {}
    }
  },
  methods: {
    /**
     * [点击表头，input自动聚焦]
     * @param {[Int]} index 索引：大类
     * @param {[Int]} key   索引：小类
     */
    tableHeaderClick(index, key) {
      const that = this
      setTimeout(function () {
        that.$refs[`input_${index}_${key}`][0].focus()
      }, 100)
    },
    /**
     * [合计]
     */
    getSummaries(param) {
      const { countData } = this
      const { columns } = param
      const arr = []
      columns.forEach(function (item, index) {
        if (index === 0) {
          arr.push('合计')
        } else if (item.columnKey && item.columnKey.length > 6) {
          const [, , word, value] = item.columnKey.split('^')
          if (countData[word]) {
            arr.push(countData[word][value])
          } else {
            arr.push('')
          }
        } else {
          arr.push('')
        }
      })
      return arr
    },
    /**
     * [表头：清空输入框]
     * @param {[String]} name 字段名
     */
    clear(name) {
      this.searchObj[name] = ''
    },
    /**
     * [表头：改变值]
     * @param {[String]} key   属性名
     * @param {[String]} value 属性值
     * @param {[String]} index 大类code
     */
    change(key, value, index) {
      const obj = { [key]: value.trim() }
      /** 添加数据 **/
      this.$store.commit('assignData2', { name: 'searchHeader', obj, index })
      /** 请求：数据 **/
      this.$store.dispatch('A_getData')
    },
    /**
     * [合计]
     */
    clickCount() {
      /** 请求：合计 **/
      this.$store.dispatch('A_count')
    },
    /**
     * [合计内容]
     */
    summaryMethod({ columns, data }) {
      const { countData } = this
      const arr = []
      columns.forEach(function (item, index) {
        if (index === 0) {
          arr.push('合计')
        } else if (item.columnKey && item.columnKey.length > 6) {
          const [, , word, value] = item.columnKey.split('^')
          if (countData[word]) {
            arr.push(countData[word][value])
          } else {
            arr.push('')
          }
        } else {
          arr.push('')
        }
      })
      return arr
    },
    /**
     * [合并：表格单元格]
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 4 || (typeof column.columnKey === 'string' && column.columnKey.split('^')[1] === '1')) {
        if (row.arrLength) {
          return { rowspan: row.arrLength, colspan: 1 } // 合并
        } else {
          return { rowspan: 0, colspan: 0 } //      隐藏
        }
      }
    },
    /**
     * [改变样式：隔行变色]
     */
    rowStyle({ row, rowIndex }) {
      if (row.index % 2 === 1) {
        return { background: 'oldlace' }
      }
    },
    /**
     * [改变样式：单元格]
     * @param {[Object]} row         数据：行
     * @param {[Object]} column      数据：列
     * @param {[Int]}    rowIndex    索引：行
     * @param {[Int]}    columnIndex 索引：列
     */
    cellStyle({ row, column, rowIndex, columnIndex }) {
      // return { background: this.colorObj[column.columnKey] }
    },
    /**
     * [改变样式：表头]
     * @param {[Object]} row         数据：所有列
     * @param {[Object]} column      数据：此列
     * @param {[Int]}    rowIndex    索引：行
     * @param {[Int]}    columnIndex 索引：列
     */
    headerStyle({ row, column, rowIndex, columnIndex }) {
      if (column.columnKey) {
        return { backgroundImage: `linear-gradient(rgba(255, 255, 255, .3) 0%, ${this.colorArr[parseInt(column.columnKey) % 9]} 80%)` }
        // return { background: this.colorArr[parseInt(column.columnKey) % 8], color: '#ffffff' }
      }
    },
    /**
     * [兼容IE11：数组includes]
     * @param  {[String]}  str 关键字
     * @param  {[Array]}   arr 数组
     * @return {[Boolean]}     true || false
     */
    arrIncludes(str, arr = []) {
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
.tableBox {
  width: 100%;
  height: 100%;
  position: relative;
}
.comTable {
  border: 0;
}
</style>

<style>
.comTable::before, .comTable::after {
  height: 0 !important;
}
.el-table__fixed::before, .el-table__fixed::after {
  height: 0 !important;
}
.comTable > .el-table__footer-wrapper {
  position: absolute;
  bottom: 0;
}
</style>
