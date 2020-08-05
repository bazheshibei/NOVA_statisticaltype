
<!-- 表格模块 -->

<template>
  <div class="tableBox" ref="box" v-loading="isLoading" element-loading-text="请求数据中">
    <div class="tableBox2">

      <!-- 表格：表头 -->
      <el-table ref="table_1" class="totalTable_1" :data="[]" size="mini" border :style="topBottomStyle"
        :row-style="rowStyle" :cell-style="cellStyle" :header-cell-style="headerStyle" :span-method="objectSpanMethod"
      >
        <el-table-column prop="custom_name" label="客户名称" :resizable="false" fixed></el-table-column>
        <el-table-column prop="dress_type_name" label="服装品类" :resizable="false" fixed></el-table-column>
        <el-table-column prop="custom_dress_series_name" label="系列名称" :resizable="false" fixed></el-table-column>
        <el-table-column prop="style_name" label="款式名称" :resizable="false" fixed></el-table-column>
        <el-table-column prop="dh_item_name" label="大货项目名称" :resizable="false" fixed></el-table-column>
        <div v-for="(item, index) in selectArr" :key="'_' + item.word">
          <div v-for="(val, key) in item.options[1].options" :key="val.label"
             v-if="arrIncludes(val.label, searchLabel[item.word])"
          >
            <el-table-column :label="val.label" min-width="100" :resizable="false"
              :column-key="index + '^' + item.columnKey + '^' + item.word + '^' + val.value"
            >
              <template slot="header" slot-scope="scope">
                <el-popover placement="top" width="250" trigger="click">
                  <el-input :ref="'input_' + index + '_' + key" clearable v-model="searchObj[val.value]" placeholder="多个查询空格分隔" @clear="clear(val.value)" @change="change(val.value, $event, item.word)"></el-input>
                  <div class="thText" :class="searchObj[val.value] ? 'thActive' : ''" slot="reference" @click="tableHeaderClick(index, key)">
                    {{val.label}}<span><i class="el-icon-search"></i></span>
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
      <!-- /表格：表头 -->

      <div ref="table_2_box" class="scrollBox_2" :style="contentStyle">
        <!-- 表格：内容 -->
        <el-table ref="table_2" class="totalTable_2" :data="tableData" size="mini" border
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
        <!-- /表格：内容 -->
      </div>

      <!-- 表格：合计 -->
      <el-table ref="table_3" class="totalTable_3" :data="tableData" size="mini" border show-summary :summary-method="getSummaries" :style="topBottomStyle">
        <el-table-column prop="custom_name" label="客户名称" fixed></el-table-column>
        <el-table-column prop="dress_type_name" label="服装品类" fixed></el-table-column>
        <el-table-column prop="custom_dress_series_name" label="系列名称" fixed></el-table-column>
        <el-table-column prop="style_name" label="款式名称" fixed></el-table-column>
        <div v-for="(item, index) in selectArr" :key="item.word">
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
      <!-- /表格：合计 -->

      <span style="display: none;">{{is_A_search}}</span>

    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  created() {},
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
    ...mapState({
      is_A_search(state) {
        const that = this
        /* 高度：表格内容 */
        let i = 0
        const timer = setInterval(function () {
          if (that.$refs.table_1 && that.$refs.box) {
            if (!that.contentStyle.height && that.$refs.table_1.$el) {
              const boxHeight = that.$refs.box.clientHeight
              const table_1_height = that.$refs.table_1.$el.clientHeight
              const table_3_height = 26
              const num = boxHeight - table_1_height - table_3_height
              that.contentStyle = { height: `${num}px` }
              clearInterval(timer)
            }
          } else {
            if (i > 500) {
              clearInterval(timer)
            }
          }
          i++
        }, 10)
        /* 宽度：是否出现下拉滚动条 */
        if (that.$refs.table_2_box && that.$refs.table_2 && that.$refs.table_2.$el) {
          setTimeout(function () {
            const width = that.$refs.table_2_box.clientWidth
            that.topBottomStyle = { width: `${width}px` }
          }, 100)
        }
        return state.is_A_search
      }
    }),
    ...mapGetters(['tableData']),
    /**
     * [下拉框数据]
     */
    selectArr() {
      const arr = this.$store.state.selectArr
      if (arr.length) {
        // console.log('arr ----- ', arr)
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
/*** 表格滚动条，移动到div ***/
.tableBox {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.tableBox2 {
  width: max-content;
  height: 100%;
}
.scrollBox_2 {
  width: auto;
  height: auto;
  overflow-y: auto;
  flex: 1;
}
</style>

<style>
/*** 表格：表头 ***/
.totalTable_1 > .el-table__body-wrapper {
  /* 隐藏内容 */
  display: none !important;
}
.totalTable_1 > .el-table__fixed > .el-table__fixed-body-wrapper {
  display: none !important;
}

/*** 表格：内容 ***/
.totalTable_2 {
  flex: 1 !important;
}
.totalTable_2 > .el-table__header-wrapper {
  /* 隐藏表头：自定义项 */
  display: none !important;
}
.totalTable_2 > .el-table__fixed > .el-table__fixed-header-wrapper {
  /* 隐藏表头：fixed项 */
  display: none !important;
}

/*** 表格：合计 ***/
.totalTable_3 {
  border-bottom: 0;
}
.totalTable_3 > .el-table__footer-wrapper, .totalTable_3 > .el-table__fixed {
  height: 25px !important;
}
.totalTable_3 > .el-table__body-wrapper {
  /* 隐藏内容 */
  display: none !important;
}
.totalTable_3 > .el-table__header-wrapper {
  /* 隐藏表头：自定义项 */
  display: none !important;
}
</style>
