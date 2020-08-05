
<!-- 搜索模块 -->

<template>
  <el-collapse-transition>

    <div class="transitionBox" :style="!isShow ? 'min-height: 30px' : ''">
      <div class="iBox" @click="isShow = !isShow">
        <i class="el-icon-arrow-up" v-show="isShow"></i>
        <i class="el-icon-arrow-down" v-show="!isShow"></i>
      </div>

      <div class="comBox" v-show="isShow">
        <el-popover placement="bottom" width="930" v-for="(item, index) in selectArr" :key="'searchBox_' + index">
          <!-- 内部 -->
          <div v-for="(group, groupKey) in item.options" :key="group.label">
            <div class="checkboxBox" :class="!groupKey ? 'checkboxBoxActive' : ''" v-if="!groupKey">
              <el-checkbox-button class="comCheckboxButton" v-model="pageData[item.word][val.value]"
                v-for="(val, key) in group.options" :key="'options_' + key" :label="val.label" @change="checkboxChange(item.word, val.value, index, $event)"
              ></el-checkbox-button>
            </div>
            <div class="checkboxBox" v-else>
              <el-checkbox class="comCheckbox" size="mini" v-model="pageData[item.word][val.value]"
                v-for="(val, key) in group.options" :key="'options_' + key" :label="val.label" @change="checkboxChange(item.word, val.value, index, $event)"
              ></el-checkbox>
            </div>
          </div>
          <!-- 外部 -->
          <div class="searchBox" slot="reference">
            <div class="searchName"
              :style="(item.id !== '402888f371ba89940171ba901d1b0000' && item.id !== '402888f371ba89940171ba91a3590001' && item.id !== '402888f371ba89940171ba91f1660002' && item.id !== '402888f371ba89940171ba94a9e80007' && item.id !== deleteType && deleteType !== 'asd') ? 'text-decoration: line-through;' : ''"
            >
              <i class="el-icon-s-help" :style="{ color: colorArr[index % 9] }"></i>{{item.name}}：
            </div>
            <el-input size="mini" suffix-icon="el-icon-arrow-down" placeholder="请选择"
              :value="searchLabel[item.word] ? searchLabel[item.word].join('、') : ''"
            >
            </el-input>
          </div>
        </el-popover>

        <div class="searchBox">
          <div class="searchName">项目名称：</div>
          <el-input size="mini" v-model="inputVal" placeholder="多个查询空格分隔" :disabled="!isChoose3" @input="input"></el-input>
        </div>

        <div class="searchBtnBox">
          <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search || !isChooseSelect" @click="submit({ operationType: 'search' })">
            查询 <i class="el-icon-search"></i>
          </el-button>
          <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search || !isChooseSelect" @click="showAdvancedQuery">
            高级查询 <i class="el-icon-s-tools"></i>
          </el-button>
          <el-button type="primary" size="mini" plain @click="reset">
            重置 <i class="el-icon-refresh"></i>
          </el-button>
          <el-button type="warning" size="mini" plain :disabled="!is_A_count || !isChooseSelect" @click="clickCount">
            合计 <i class="el-icon-s-data" v-if="is_A_count"></i><i class="el-icon-loading" v-else></i>
          </el-button>
          <el-button type="success" size="mini" plain :disabled="!isChooseSelect" @click="submit({ operationType: 'export' })">
            导出 <i class="el-icon-download" v-if="is_A_export"></i><i class="el-icon-loading" v-else></i>
          </el-button>
        </div>

      </div>
    </div>

  </el-collapse-transition>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {
      pageData: {}, // 页面数据
      isShow: true, // 是否展示
      inputVal: '' //  input输入值
    }
  },
  created() {
    /* 提取上次的数据 */
    const searchVal = JSON.parse(localStorage.getItem('NOVA_total_searchVal')) || {}
    const searchLabel = JSON.parse(localStorage.getItem('NOVA_total_searchLabel')) || {}
    const searchText = localStorage.getItem('NOVA_total_searchText') || ''
    const exportSelect = JSON.parse(localStorage.getItem('NOVA_total_exportSelect')) || {}
    /** 保存数据 **/
    this.$store.commit('saveData', { name: 'searchVal', obj: searchVal })
    this.$store.commit('saveData', { name: 'searchLabel', obj: searchLabel })
    this.$store.commit('saveData', { name: 'searchText', obj: searchText })
    this.$store.commit('saveData', { name: 'exportSelect', obj: exportSelect })
    /* 赋值 */
    this.inputVal = searchText
  },
  computed: {
    /* ['选中：大类', '选中：表头名称', '搜索：input'] */
    ...mapState(['searchVal', 'searchLabel', 'searchText', 'is_A_search', 'is_A_export', 'is_A_count', 'is_request_count', 'colorArr']),
    ...mapState({
      /** 下拉框数据 **/
      selectArr(state) {
        const that = this
        const pageData = {}
        const { selectArr } = state
        selectArr.forEach(function (item) {
          pageData[item.word] = { '-1': false, '-2': false, '-3': false }
          if (item.options) {
            item.options[1].options.forEach(function (val) {
              if (that.arrIncludes(val.value, state.searchVal[item.word])) {
                pageData[item.word][val.value] = true
              } else {
                pageData[item.word][val.value] = false
              }
            })
          }
        })
        this.pageData = pageData
        return selectArr
      }
    }),
    /* 是否需要：搜索, 删除线指标 */
    ...mapGetters(['isSearch', 'deleteType', 'changeSelect', 'isSearch', 'isChooseSelect', 'isChoose3'])
  },
  methods: {
    /**
     * [显示：高级查询]
     */
    showAdvancedQuery() {
      this.$store.commit('saveData', { name: 'isDialog', obj: true })
    },
    /**
     * [复选框改变值]
     * @param {[String]}  word  大类名
     * @param {[String]}  value 当前值
     * @param {[Int]}     index 大类索引
     * @param {[Boolean]} event 事件返回值 true || false
     */
    checkboxChange(word, value, index, event) {
      const { pageData } = this
      const options = this.selectArr[index].options[1].options // 当前下拉框：全部选项
      const val = [] //          选中：大类
      const label = [] //        选中：表头名称
      const exportSelect = [] // 导出用到的，下拉选项数据
      if (value === '-1') {
        /* 全选 */
        for (const x in pageData[word]) {
          pageData[word][x] = true
        }
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
          val.push(item.value) //   值
          label.push(item.label) // 属性名
        }
      } else if (value === '-2') {
        /* 反选 */
        for (const x in pageData[word]) {
          pageData[word][x] = !pageData[word][x]
        }
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          if (pageData[word][item.value] || item.is_default_select) {
            pageData[word][item.value] = true
            exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
            val.push(item.value) //   值
            label.push(item.label) // 属性名
          }
        }
        this.pageData = pageData
      } else if (value === '-3') {
        /* 全不选 */
        for (const x in pageData[word]) {
          pageData[word][x] = false
        }
      } else {
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          if (pageData[word][item.value] || item.is_default_select) {
            pageData[word][item.value] = true
            exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
            val.push(item.value) //   值
            label.push(item.label) // 属性名
          }
        }
      }
      /* 保存数据 */
      this.$store.commit('assignData', { name: 'exportSelect', obj: { [word]: exportSelect } })
      this.$store.commit('assignData', { name: 'searchVal', obj: { [word]: val } })
      this.$store.commit('assignData', { name: 'searchLabel', obj: { [word]: label } })
      /* (大类变化 && 不需要手动搜索) -> 自动请求 */
      const { changeSelect, isSearch, is_request_count } = this
      if (changeSelect && !isSearch) {
        /** 查询 / 导出 **/
        this.submit({ isLoading: false })
        /* 请求过合计的话，跟着请求合计 */
        if (is_request_count) {
          /** 请求：合计 **/
          this.$store.dispatch('A_count')
        }
      }
    },
    /**
     * [项目名称：输入搜索文字]
     */
    input(event) {
      this.$store.commit('saveData', { name: 'searchText', obj: event })
    },
    /**
     * [查询 / 导出]
     * @param {[String]}  operationType 搜索 / 导出
     * @param {[Boolean]} isLoading     是否显示加载动画
     */
    submit(params = {}) {
      const { operationType = 'search', isLoading = true } = params
      /** 查询 / 导出 **/
      this.$store.dispatch('search', { operationType, isLoading })
    },
    /**
     * [合计]
     */
    clickCount() {
      /** 请求：合计 **/
      this.$store.dispatch('A_count')
    },
    /**
     * [重置]
     */
    reset() {
      this.$store.commit('saveData', { name: 'searchVal', obj: {} })
      this.$store.commit('saveData', { name: 'searchLabel', obj: {} })
      this.$store.commit('saveData', { name: 'searchText', obj: '' })

      // this.$store.commit('saveData', { name: 'searchHeader', obj: {} })
    },
    /**
     * [下拉框改变值]
     * @param {[String]} word  属性名
     * @param {[Array]}  event 事件返回值
     * @param {[Int]}    index 组件索引
     */
    selectChange(word, event, index) {
      const options = this.selectArr[index].options[1].options // 当前下拉框：全部选项
      if (this.arrIncludes(-1, event)) {
        /* 全选 */
        const val = []
        const label = []
        const exportSelect = []
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
          val.push(item.value) //   值
          label.push(item.label) // 属性名
        }
        this.$store.commit('assignData', { name: 'exportSelect', obj: { [word]: exportSelect } })
        this.$store.commit('assignData', { name: 'searchVal', obj: { [word]: val } })
        this.$store.commit('assignData', { name: 'searchLabel', obj: { [word]: label } })
        this.selectBlur(index) // 下拉框失焦
      } else if (this.arrIncludes(-2, event)) {
        /* 反选 */
        const selectArr = this.searchVal[word] // 数组：选中的值
        const arr = []
        const label = []
        const exportSelect = []
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          if (!this.arrIncludes(item.value, selectArr)) {
            exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
            arr.push(item.value) //   值
            label.push(item.label) // 属性名
          }
        }
        this.$store.commit('assignData', { name: 'exportSelect', obj: { [word]: exportSelect } })
        this.$store.commit('assignData', { name: 'searchVal', obj: { [word]: arr } })
        this.$store.commit('assignData', { name: 'searchLabel', obj: { [word]: label } })
        this.selectBlur(index) // 下拉框失焦
      } else if (this.arrIncludes(-3, event)) {
        /* 全不选 */
        this.$store.commit('assignData', { name: 'exportSelect', obj: { [word]: [] } })
        this.$store.commit('assignData', { name: 'searchVal', obj: { [word]: [] } })
        this.$store.commit('assignData', { name: 'searchLabel', obj: { [word]: [] } })
        this.selectBlur(index) // 下拉框失焦
      } else {
        /* 点击选项 */
        const label = []
        const exportSelect = []
        for (let i = 0; i < options.length; i++) {
          const item = options[i]
          if ( this.arrIncludes(item.value, event) || item.is_default_select) {
            exportSelect.push({ statistics_field_name: item.value, statistics_remark: item.label })
            label.push(item.label)
          }
        }
        this.$store.commit('assignData', { name: 'exportSelect', obj: { [word]: exportSelect } })
        this.$store.commit('assignData', { name: 'searchLabel', obj: { [word]: label } })
      }
      /* (大类变化 && 不需要手动搜索) -> 自动请求 */
      const { changeSelect, isSearch, is_request_count } = this
      if (changeSelect && !isSearch) {
        /** 查询 / 导出 **/
        this.submit({ isLoading: false })
        /* 请求过合计的话，跟着请求合计 */
        if (is_request_count) {
          /** 请求：合计 **/
          this.$store.dispatch('A_count')
        }
      }
    },
    /**
     * [下拉框失焦]
     * @param {[Int]} index 组件索引
     */
    selectBlur(index) {
      const that = this
      setTimeout(function () {
        that.$refs.select[index].blur()
      }, 0)
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
.transitionBox { /* 折叠容器 */
  position: relative;
}
.iBox { /* 折叠开关容器 */
  height: 40px;
  font-size: 12px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
}
.iBox > i {
  font-size: 20px;
}
.comBox { /* 表单容器 */
  margin-right: 40px;
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.searchBox { /* 单个组件块 */
  width: 290px;
  font-size: 12px;
  margin: 5px 0px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.searchBtnBox {
  font-size: 12px;
  margin: 5px 10px 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex: 1;
}
.searchName { /* 单个 label */
  width: 110px;
  min-width: 110px;
  text-align: right;
}
</style>

<style>
/*** 复选框 ***/
.checkboxBox {
  max-height: 550px !important;
  padding: 0 10px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-wrap: wrap !important;
}
.checkboxBoxActive {
  padding: 6px 10px !important;
  background: #f5f7fa !important;
}
.comCheckbox {
  width: 120px !important;
  font-size: 12px !important;
  margin: 2px 10px 2px 0 !important;
  display: flex !important;
  align-items: flex-start !important;
}
.comCheckbox > .el-checkbox__label {
  font-size: 12px !important;
  font-weight: normal !important;
  white-space: normal !important;
  text-align: left !important;
}
.el-checkbox__input.is-checked+.el-checkbox__label { /* 选中项：文字 */
  color: #606266 !important;
  font-weight: normal !important;
}
.comCheckboxButton > .el-checkbox-button__inner {
  font-size: 12px !important;
  font-weight: normal !important;
  padding: 7px 15px !important;
}
</style>
