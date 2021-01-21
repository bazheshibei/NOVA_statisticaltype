
import Vue from 'vue'
import Vuex from 'vuex'
import Dev from './dev.js' //   本地开发代码
import Prod from './prod.js' // 生产环境代码
import Tool from './tool.js'
Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
    nowCodeType: 'Prod', //     当前代码类型
    codeObj: { Dev, Prod }, // 代码类型 { Dev: '开发', Prod: '生产' }
    /* 静态数据 */
    colorArr: ['#ff0000', '#ffc000', '#92d050', '#00b0f0', '#8064a2', '#76933c', '#e26b0a', '#558ed5', '#963634'],
    /* 接口返回 */
    selectArr: [], //      整理后的指标数组
    dataList: [], //       表格数据[未处理]
    /* 页面操作 */
    searchText: '', //     搜索：input
    searchHeader: {}, //   搜索：表头
    /* 整理页面获取的数据 */
    selectNodeObj: {}, //  select 选中的节点对象 [通过 Tool.returnSearchData() 生成 searchData, searchVal, searchLabel]
    selectShowText: [], // select 展示的文字
    searchData: {}, //     select 选中的指标数据
    searchVal: {}, //      选中：大类 { dh_relate: ['dh_item_name'] }
    searchLabel: {}, //    选中：表头名称 { dh_relate: ['项目名称'] }
    /* 高级查询 */
    isDialog: false, //    是否显示：高级查询
    advancedQuery: [], //  查询条件
    /**/
    tableSignArr: [], //   表格签名数组  [用于下拉框选项变更后，生成新的表格]
    lastSearchVal: {}, //  上次搜索：大类
    lastSearchText: '', // 上次搜索：input
    /* 加载中 */
    isLoading: false,
    /* 合计 */
    countData: {}, //      合计数据
    /* 导出 */
    // exportSelect: { //  导出用到的，下拉选项数据
    //   dh_relate: [{ statistics_field_name: 'dh_item_name', statistics_remark: '项目名称' }]
    // },
    /* 分页 */
    pagenum: 1, //         页数
    rownum: 10, //         每页条数
    pageCount: 0, //       总条数
    /* 状态 */
    is_A_search: true, //      是否可以：搜索
    is_A_export: true, //      是否可以：导出
    is_A_count: true //        是否可以：合计
  },
  getters: {
    /**
     * [表格数据]
     */
    tableData: state => {
      return Tool._tableData(state)
    },
    /**
     * [删除线指标]
     * 跟此值相冲突的大类，标记删除线
     */
    deleteType: state => {
      return Tool._deleteType(state)
    },
    /**
     * [是否选择：大类]
     */
    isChooseSelect: state => {
      return Tool._isChooseSelect(state)
    },
    /**
     * [是否选择：大货相关 || 开发相关 || 设计相关]
     */
    isChoose3: state => {
      return Tool._isChoose3(state)
    },
    /**
     * [是否需要：搜索]
     */
    isSearch: (state, getter) => {
      const { changeSelect, changeInput, changeHeader, tableData } = getter
      // getter.changeSelect ||
      return changeSelect || changeInput || changeHeader || !tableData.length // 大类变化 || input 变化 || 表头变化 || 没有表格数据
    },
    /**
     * [是否变化：大类]
     */
    changeSelect: state => {
      return Tool._changeSelect(state)
    },
    /**
     * [是否变化：input]
     */
    changeInput: state => {
      return Tool._changeInput(state)
    },
    /**
     * [是否变化：表头]
     */
    changeHeader: state => {
      return Tool._changeHeader(state)
    },
    /**
     * [表头签名]
     */
    tableSign: state => {
      const str = JSON.stringify(state.searchLabel)
      state.tableSignArr.push(str)
      return str
    }
  },

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    assignData(state, params) {
      const { name, obj } = params
      const data = state[name] || {}
      state[name] = Object.assign({}, data, obj)
    },
    /**
     * [添加数据：二级]
     * @param {[String]} name  属性名
     * @param {[Object]} obj   属性值
     * @param {[String]} index 二级属性
     */
    assignData2(state, params) {
      const { name, obj, index } = params
      const data = state[name] || {}
      data[index] = Object.assign({}, data[index], obj)
      state[name] = Object.assign({}, data)
    }
  },
  actions: {
    /**
     * [请求：指标]
     */
    A_getCode({ state, dispatch }, { that }) {
      state.codeObj[state.nowCodeType].A_getCode(state, dispatch, that)
    },
    /**
     * [请求：数据]
     */
    A_getData({ state, dispatch, getters }, params = {}) {
      state.codeObj[state.nowCodeType].A_getData(state, getters, dispatch, params)
    },
    /**
     * [请求：合计]
     */
    A_count({ state, dispatch, getters }) {
      state.codeObj[state.nowCodeType].A_count(state, getters, dispatch)
    },
    /**
     * [请求：删除文件]
     */
    A_exportDelete({ state }) {
      state.codeObj[state.nowCodeType].A_exportDelete()
    },
    /**
     * [查询 / 导出]
     */
    search({ state, dispatch }, params = {}) {
      /* 本地缓存 */
      const { selectNodeObj, selectShowText, searchText } = state
      localStorage.setItem('NOVA_total_selectNodeObj', JSON.stringify(selectNodeObj)) //   select 选中的节点对象 [通过 Tool.returnSearchData() 生成 searchData, searchVal, searchLabel]
      localStorage.setItem('NOVA_total_selectShowText', JSON.stringify(selectShowText)) // select 展示的文字
      localStorage.setItem('NOVA_total_searchText', searchText) //                         项目名称
      /* 记录数据 */
      const { searchVal } = state
      state.lastSearchVal = Object.assign({}, searchVal)
      state.lastSearchText = searchText
      /** 请求：数据 **/
      const { operationType, isLoading } = params
      dispatch('A_getData', { operationType, isLoading })
    }
  }
})

export default store
