// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Api from '@/config/api'
import Tool from './tool.js'
import { Loading } from 'element-ui'
/* 模块 */
// import UserInfo from './modules/userInfo' //     用户信息
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    // UserInfo, Shop, Menu, Table, Order, Beforehand, Music
  },

  state: {
    colorArr: ['#ff0000', '#ffc000', '#92d050', '#00b0f0', '#8064a2', '#76933c', '#e26b0a', '#558ed5', '#963634'],
    dataList: [], //       接口返回：[未处理]表格数据
    tableSignArr: [], //   表格签名数组  [用于下拉框选项变更后，生成新的表格]
    lastSearchVal: {}, //  上次搜索：大类
    lastSearchText: '', // 上次搜索：input
    selectArr: [], //      接口返回：[处理后]下拉框数据
    searchVal: { //      选中：大类
      dh_relate: ['dh_item_name']
    },
    searchLabel: { //    选中：表头名称
      dh_relate: ['项目名称']
    },
    searchText: '', //     搜索：input
    searchHeader: {}, //   搜索：表头
    /* 高级查询 */
    isDialog: false, //    是否显示：高级查询
    advancedQuery: [], //  查询条件
    /* 加载中 */
    isLoading: false,
    /* 合计 */
    countData: {}, //      合计数据
    /* 导出 */
    exportSelect: { //   导出用到的，下拉选项数据
      dh_relate: [{ statistics_field_name: 'dh_item_name', statistics_remark: '项目名称' }]
    },
    /* 分页 */
    pagenum: 1, //         页数
    rownum: 10, //         每页条数
    pageCount: 0, //       总条数
    /* 状态 */
    is_A_search: true, //      是否可以：搜索
    is_A_export: true, //      是否可以：导出
    is_A_count: true, //       是否可以：合计
    is_request_count: false // 是否请求过：合计
  },
  getters: {
    /**
     * [表格数据]
     */
    tableData: state => {
      return Tool.tableData(state)
    },
    /**
     * [删除线指标]
     * 跟此值相冲突的大类，标记删除线
     */
    deleteType: state => {
      return Tool.deleteType(state)
    },
    /**
     * [是否选择：大类]
     */
    isChooseSelect: state => {
      return Tool.isChooseSelect(state)
    },
    /**
     * [是否选择：大货相关 || 开发相关 || 设计相关]
     */
    isChoose3: state => {
      return Tool.isChoose3(state)
    },
    /**
     * [是否需要：搜索]
     */
    isSearch: (state, getter) => {
      // getter.changeSelect ||
      return (getter.changeInput || getter.changeHeader || !getter.tableData.length)
    },
    /**
     * [是否变化：大类]
     */
    changeSelect: state => {
      return Tool.changeSelect(state)
    },
    /**
     * [是否变化：input]
     */
    changeInput: state => {
      return Tool.changeInput(state)
    },
    /**
     * [是否变化：表头]
     */
    changeHeader: state => {
      return Tool.changeHeader(state)
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
    A_getCode({ state, dispatch }) {
      const loadingInstance = Loading.service({ text: '正在获取指标' })

      /** 请求：删除文件 **/
      dispatch('A_exportDelete')
      /* 发送请求 */
      const name = '指标'
      const suc = function (res) {
        // console.log('指标 ----- ', res)
        loadingInstance.close()
        const arr = []
        res.forEach(function (item) {
          const { type_name, type_code, statistical_type_id, indicatorlist } = item
          let num = 0
          if (type_code === 'dh_relate' || type_code === 'kf_relate' || type_code === 'sj_relate') {
            num = 1 // 用于合并表格行
          }
          /* 处理：一级属性 */
          const obj = { name: type_name, word: type_code, id: statistical_type_id, columnKey: `${num}` }
          /* 处理：下拉选项 */
          const options = [{ label: ' ', options: [{ value: '-1', label: '全选' }, { value: '-2', label: '反选' }, { value: '-3', label: '全不选' }] }]
          const optionsList = []
          // const optionsList = {}
          indicatorlist.forEach(function (val) {
            const { indicator_code: value, indicator_name: label, statistical_indicator_id: id, is_default_select, search_type, enum_value } = val
            optionsList.push({ value, label, id, is_default_select, search_type, enum_value })
            // optionsList[value] = { value, label, id, is_default_select, search_type, enum_value }
          })
          options.push({ label: '', options: optionsList })
          obj.options = options
          arr.push(obj)
        })
        // console.log('指标 ----- ', arr)
        state.selectArr = arr
      }
      Api({ name, obj: {}, suc })
    },
    /**
     * [请求：数据]
     */
    A_getData({ state, dispatch, getters }, params = {}) {
      const { operationType = 'search', isLoading = false } = params // 'export' 导出
      const typeObj = { search: 'is_A_search', export: 'is_A_export' }
      if (state[typeObj[operationType]] === true && getters.isChooseSelect === true) { // 可以[搜索 || 导出] && 选了大类
        state[typeObj[operationType]] = false
        /** 请求：删除文件 **/
        dispatch('A_exportDelete')
        /* 整理数据 */
        state.isLoading = isLoading
        const { pagenum, rownum, searchText, searchHeader, exportSelect, selectArr, colorArr, advancedQuery: advancedQueryArr } = state
        const columncondition = JSON.stringify(Tool.exportSelect(exportSelect))
        const statisticsIndexNum = JSON.stringify(Tool.nameColor(selectArr, colorArr))
        const itemname = searchText.trim()
        const searchcontent = JSON.stringify(searchHeader)
        const advancedQuery = JSON.stringify(advancedQueryArr)
        /* 请求 */
        const name = '数据'
        const method = 'post'
        const obj = {
          operationType, //      搜索 || 导出
          statisticsIndexNum, // 所有大类名字数组 && 所有颜色数组 [导出用]
          columncondition, //    选中的大类
          pagenum, //            页数
          rownum, //             每页条数
          itemname, //           项目名称
          searchcontent, //      表头搜索
          advancedQuery //       高级查询
        }
        if (operationType === 'search') {
          /* 搜索 */
          const suc = function (res) {
            state[typeObj[operationType]] = true // 可以：搜索 / 导出
            state.isLoading = false //              关闭：加载动画
            const { datalist, datanum = 0 } = res
            state.pageCount = datanum //                          赋值：总条数
            state.dataList = datalist === null ? [] : datalist // 赋值：表格数据
            state.countData = {} //                               重置：合计
          }
          Api({ name, obj, suc, method })
        } else if (operationType === 'export') {
          /* 导出 */
          const suc = function (res) {
            state[typeObj[operationType]] = true //                     可以：搜索 / 导出
            state.isLoading = false //                                  关闭：加载动画
            localStorage.setItem('NOVA_total_export_path', res.data) // 保存：文件地址
            /* 下载 */
            // const host = 'http://10.10.0.226:8080/nova'
            const host = window.location.origin + '/nova'
            const a = document.createElement('a')
            a.href = host + res.data
            a.download = '自定义统计'
            a.click()
          }
          Api({ name, obj, suc, method })
        }
      }
    },
    /**
     * [请求：合计]
     */
    A_count({ state, dispatch, getters }) {
      if (state.is_A_count === true && getters.isChooseSelect === true) { // 可以合计 && 选了大类
        state.is_A_count = false
        /** 请求：删除文件 **/
        dispatch('A_exportDelete')
        /* 整理数据 */
        const { pagenum, rownum, searchText, searchHeader, exportSelect, advancedQuery: advancedQueryArr } = state
        const columncondition = JSON.stringify(Tool.exportSelect(exportSelect))
        const searchcontent = JSON.stringify(searchHeader)
        const itemname = searchText.trim()
        const advancedQuery = JSON.stringify(advancedQueryArr)
        /* 请求 */
        const name = '合计'
        const method = 'post'
        const obj = {
          columncondition, // 选中的大类
          pagenum, //         页数
          rownum, //          每页条数
          itemname, //        项目名称
          searchcontent, //   表头搜索
          advancedQuery //    高级查询
        }
        const suc = function (res) {
          state.is_A_count = true //       是否：可以合计
          state.is_request_count = true // 是否：请求过合计
          state.countData = res //         赋值：合计数据
        }
        Api({ name, obj, suc, method })
      }
    },
    /**
     * [请求：删除文件]
     */
    A_exportDelete({ state }) {
      const path = localStorage.getItem('NOVA_total_export_path') || ''
      if (path.length) {
        const name = '删除'
        const obj = { filePath: encodeURI(path) }
        const suc = function (res) {
          localStorage.removeItem('NOVA_total_export_path')
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [查询 / 导出]
     */
    search({ state, dispatch }, params = {}) {
      const { operationType, isLoading } = params
      const { searchVal, searchLabel, searchText, exportSelect } = state
      /* 记录数据 */
      state.lastSearchVal = Object.assign({}, searchVal)
      state.lastSearchText = searchText
      /* 本地缓存 */
      localStorage.setItem('NOVA_total_searchVal', JSON.stringify(searchVal))
      localStorage.setItem('NOVA_total_searchLabel', JSON.stringify(searchLabel))
      localStorage.setItem('NOVA_total_searchText', searchText)
      localStorage.setItem('NOVA_total_exportSelect', JSON.stringify(exportSelect))
      /** 请求：数据 **/
      dispatch('A_getData', { operationType, isLoading })
    }
  }
})

export default store
