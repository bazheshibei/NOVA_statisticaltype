
<!-- 搜索模块 -->
<template>
  <el-collapse-transition>

    <div class="transitionBox" :style="!isShow ? 'min-height: 30px' : ''">
      <!-- 折叠按钮 -->
      <div class="iBox" @click="isShowContent">
        <i class="el-icon-arrow-up" v-show="isShow"></i>
        <i class="el-icon-arrow-down" v-show="!isShow"></i>
      </div>

      <div class="comBox" v-show="isShow">

        <!-- select 选择器 -->
        <el-popover placement="bottom" v-for="(item, index) in selectArr" :key="'searchBox_' + index">
          <!-- 外部 -->
          <div class="searchBox" slot="reference">
            <div class="searchName" :style="_isStyle(item.id) ? 'text-decoration: line-through;' : ''">
              <i class="el-icon-s-help" :style="{ color: colorArr[index % 9] }"></i>{{item.label}}：
            </div>
            <el-input size="mini" suffix-icon="el-icon-arrow-down" placeholder="请选择" :value="selectShowText[index]"></el-input>
          </div>
          <!-- 内部 -->
          <com-tree :list="item.children" :selectIndex="index" @comTreeSubmit="comTreeSubmit"></com-tree>
        </el-popover>

        <!-- 项目名称 -->
        <div class="searchBox">
          <div class="searchName">项目名称：</div>
          <el-input class="nameInput" size="mini" v-model="projectName" placeholder="多个查询空格分隔" :disabled="!isChoose3" @input="inputProjectName"></el-input>
        </div>

        <!-- 按钮组 -->
        <div class="searchBtnBox">
          <!-- 查询禁用：不能搜索 || 没选大类 -->
          <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search || !isChooseSelect" @click="submit({ operationType: 'search' })">
            查询 <i class="el-icon-search"></i>
          </el-button>
          <!-- 高级查询禁用：不能搜索 || 没选大类 -->
          <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search || !isChooseSelect" @click="showAdvancedQuery">
            高级查询 <i class="el-icon-s-tools"></i>
          </el-button>
          <el-button type="primary" size="mini" plain @click="reset">
            重置 <i class="el-icon-refresh"></i>
          </el-button>
          <!-- 合计禁用：不能合计 || 没选大类 -->
          <el-button type="warning" size="mini" plain :disabled="!is_A_count || !isChooseSelect" @click="clickCount">
            合计 <i class="el-icon-s-data" v-if="is_A_count"></i><i class="el-icon-loading" v-else></i>
          </el-button>
          <!-- 导出禁用：没选大类 -->
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
import Tool from '@/store/tool.js'
import ComTree from './comTree.vue'
export default {
  components: { ComTree },
  data() {
    return {
      isShow: true, //       是否显示搜索条件
      selectShowText: [], // select 展示的文字
      selectNodeObj: {}, //  select 选中的节点对象
      projectName: '' //     项目名称
    }
  },
  created() {
    /* 提取上次的数据 */
    const selectNodeObj = JSON.parse(localStorage.getItem('NOVA_total_selectNodeObj')) || {} //   select 选中的节点对象 [通过 Tool.returnSearchData() 生成 searchData, searchVal, searchLabel]
    const selectShowText = JSON.parse(localStorage.getItem('NOVA_total_selectShowText')) || [] // select 展示的文字
    const searchText = localStorage.getItem('NOVA_total_searchText') || '' //                     项目名称
    const { searchData, searchVal, searchLabel } = Tool.returnSearchData(selectNodeObj)
    this.$store.commit('saveData', { name: 'selectNodeObj', obj: selectNodeObj })
    this.$store.commit('saveData', { name: 'selectShowText', obj: selectShowText })
    this.$store.commit('saveData', { name: 'searchData', obj: searchData })
    this.$store.commit('saveData', { name: 'searchVal', obj: searchVal })
    this.$store.commit('saveData', { name: 'searchLabel', obj: searchLabel })
    this.$store.commit('saveData', { name: 'searchText', obj: searchText })
    /* 赋值 */
    this.selectNodeObj = selectNodeObj
    this.selectShowText = selectShowText
    this.projectName = searchText
  },
  computed: {
    ...mapState(['selectArr', 'is_A_search', 'is_A_export', 'is_A_count', 'colorArr']),
    ...mapGetters(['isSearch', 'deleteType', 'isChooseSelect', 'isChoose3'])
  },
  methods: {
    /**
     * [切换：显示搜索条件]
     */
    isShowContent() {
      this.isShow = !this.isShow
      this.$emit('recount')
    },
    /**
     * [显示：高级查询]
     */
    showAdvancedQuery() {
      this.$store.commit('saveData', { name: 'isDialog', obj: true })
    },
    /**
     * [树形组件：提交选中值]
     * @param {[Object]} params 选中值：{ index: 0, data: { 1: {} } } ==> { index: select索引, data: { 排序: 指标全部属性值 } }
     */
    comTreeSubmit(params = {}) {
      // console.log('树形组件：提交选中值 ----- ', params)
      const { index, data = {} } = params
      /* ----- select 展示的文字 ----- */
      const { selectShowText } = this
      const selectShowTextArr = []
      for (const x in data) {
        selectShowTextArr.push(data[x].label)
      }
      const selectShowTextJoin = selectShowTextArr.join('、')
      selectShowText[index] = selectShowTextJoin
      this.selectShowText.splice(index, 1, selectShowTextJoin)
      /* ----- select 选中的指标对象 ----- */
      const { selectNodeObj } = this
      selectNodeObj[index] = Object.assign({}, data)
      this.selectNodeObj = Object.assign({}, selectNodeObj)
      /* ----- 提取：选中的指标数据 ----- */
      const { searchData, searchVal, searchLabel } = Tool.returnSearchData(selectNodeObj)
      this.$store.commit('saveData', { name: 'selectNodeObj', obj: selectNodeObj })
      this.$store.commit('saveData', { name: 'selectShowText', obj: selectShowText })
      this.$store.commit('saveData', { name: 'searchData', obj: searchData })
      this.$store.commit('saveData', { name: 'searchVal', obj: searchVal })
      this.$store.commit('saveData', { name: 'searchLabel', obj: searchLabel })
    },
    /**
     * [项目名称：输入搜索文字]
     */
    inputProjectName(event) {
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
      const { selectArr } = this
      const arr = Tool.resetSelectArr(selectArr)
      /* 接口返回 */
      this.$store.commit('saveData', { name: 'selectArr', obj: arr }) //     整理后的指标数组
      this.$store.commit('saveData', { name: 'dataList', obj: [] }) //       表格数据
      /* 页面操作 */
      this.$store.commit('saveData', { name: 'searchText', obj: '' }) //     搜索：input
      this.$store.commit('saveData', { name: 'searchHeader', obj: {} }) //   搜索：表头
      /* 整理页面获取的数据 */
      this.$store.commit('saveData', { name: 'selectNodeObj', obj: {} }) //  select 选中的节点对象 [通过 Tool.returnSearchData() 生成 searchData, searchVal, searchLabel]
      this.$store.commit('saveData', { name: 'selectShowText', obj: [] }) // select 展示的文字
      this.$store.commit('saveData', { name: 'searchData', obj: {} }) //     select 选中的指标数据
      this.$store.commit('saveData', { name: 'searchVal', obj: {} }) //      选中：大类 { dh_relate: ['dh_item_name'] }
      this.$store.commit('saveData', { name: 'searchLabel', obj: {} }) //    选中：表头名称 { dh_relate: ['项目名称'] }
      /* 高级查询 */
      this.$store.commit('saveData', { name: 'advancedQuery', obj: [] }) //  查询条件
      /* 合计 */
      this.$store.commit('saveData', { name: 'countData', obj: {} }) //      合计
      /* 分页 */
      this.$store.commit('saveData', { name: 'pagenum', obj: 1 }) //         页数
      this.$store.commit('saveData', { name: 'rownum', obj: 10 }) //         每页条数
      this.$store.commit('saveData', { name: 'pageCount', obj: 0 }) //       总条数
      /* 本页 */
      this.selectShowText = [] // select 展示的文字
      this.selectNodeObj = {} //  select 选中的节点对象
      this.projectName = '' //     项目名称
    },
    /**
     * [是否：显示管穿线]
     * @param {[String]} id 大类ID
     */
    _isStyle(id) {
      const { deleteType } = this
      const prove_1 = id !== '402888f371ba89940171ba901d1b0000' // 大货相关
      const prove_2 = id !== '402888f371ba89940171ba91a3590001' // 开发相关
      const prove_3 = id !== '402888f371ba89940171ba91f1660002' // 设计相关
      const prove_4 = id !== '402888f371ba89940171ba94a9e80007' // 客户订单相关
      const prove_5 = id !== deleteType && deleteType //           !== 第一个会冲突的大类ID
      return prove_1 && prove_2 && prove_3 && prove_4 && prove_5
    }
    //
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
/*** 弹出框 ***/
.el-popover {
  max-width: 930px !important;
  max-height: 400px !important;
  overflow: auto !important;
}
.el-popover > .popper__arrow {
  display: none !important;
}
</style>
