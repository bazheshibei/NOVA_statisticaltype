
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox } from 'element-ui'

/**
 * 生产环境代码
 */
const Prod = {}

/**
 * [请求：指标]
 */
Prod.A_getCode = function (state, dispatch, that) {
  /** 请求：删除文件 **/
  dispatch('A_exportDelete')
  /* 发送请求 */
  const name = '指标'
  const suc = function (res) {
    // console.log('指标 ----- ', res)
    // localStorage.setItem('指标', JSON.stringify(res))
    /* 返回：整理后的指标数组 */
    const selectNodeObj = JSON.parse(localStorage.getItem('NOVA_total_selectNodeObj')) || {} //   select 选中的节点对象 [通过 Tool.returnSearchData() 生成 searchData, searchVal, searchLabel]
    const { selectArr, asdObj } = Tool.returnSelectArr(res, selectNodeObj)
    state.selectArr = selectArr
    state.asdObj = asdObj
    /* 计算：表格高度 */
    that._countHeight()
  }
  Api({ name, obj: {}, suc, loading: '正在获取指标' })
}

/**
 * [请求：数据]
 */
Prod.A_getData = function (state, getters, dispatch, params) {
  const { operationType = 'search', isLoading = false } = params // 'export' 导出
  const typeObj = { search: 'is_A_search', export: 'is_A_export' }
  if (state[typeObj[operationType]] === true && getters.isChooseSelect === true) { // 可以[搜索 || 导出] && 选了大类
    state[typeObj[operationType]] = false
    /** 请求：删除文件 **/
    dispatch('A_exportDelete')
    /* 整理数据 */
    state.isLoading = isLoading
    const { pagenum, rownum, searchText, searchHeader, searchData, selectArr, colorArr, advancedQuery: advancedQueryArr, pageCount } = state
    const columncondition = JSON.stringify(Tool.columncondition(searchData))
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
        // console.log('数据 ----- res:', res)
        // localStorage.setItem('数据', JSON.stringify(res))
        state[typeObj[operationType]] = true //               可以：搜索 / 导出
        state.isLoading = false //                            关闭：加载动画
        const { datalist, datanum = 0 } = res
        state.pageCount = datanum //                          赋值：总条数
        state.dataList = datalist === null ? [] : datalist // 赋值：表格数据
        state.countData = {} //                               重置：合计
        state.tableNum = state.tableNum + 1 //                触发重新渲染表格
      }
      Api({ name, obj, suc, method })
    } else if (operationType === 'export') {
      /* 导出 */
      if (pageCount > 500) {
        obj.rownum = 500
        const max = Math.ceil(pageCount / 500) // 导出次数
        MessageBox({ title: '用户数量较大，将分次导出' })
        const NOVA_total_export_path = []
        for (let now = 1; now < max + 1; now++) {
          if (now === max) {
            const suc = function (res) {
              state[typeObj[operationType]] = true //                     可以：搜索 / 导出
              state.isLoading = false //                                  关闭：加载动画
              NOVA_total_export_path.push(res.data)
              localStorage.setItem('NOVA_total_export_path', NOVA_total_export_path.join(',')) // 保存：文件地址
              /* 下载 */
              // const host = 'http://10.10.0.226:8080/nova'
              const host = window.location.origin + '/nova'
              const a = document.createElement('a')
              a.href = host + res.data
              a.download = '自定义统计'
              a.click()
            }
            Api({ name, obj, suc, method })
          } else {
            const suc = function (res) {
              NOVA_total_export_path.push(res.data)
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
          obj.pagenum++
        }
      } else {
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
  }
}

/**
 * [请求：合计]
 */
Prod.A_count = function (state, getters, dispatch) {
  if (state.is_A_count === true && getters.isChooseSelect === true) { // 可以合计 && 选了大类
    state.is_A_count = false
    /** 请求：删除文件 **/
    dispatch('A_exportDelete')
    /* 整理数据 */
    const { pagenum, rownum, searchText, searchHeader, searchData, advancedQuery: advancedQueryArr } = state
    const columncondition = JSON.stringify(Tool.columncondition(searchData))
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
      // console.log('合计 ----- res:', res)
      localStorage.setItem('合计', JSON.stringify(res))
      state.is_A_count = true // 是否：可以合计
      state.countData = res //   赋值：合计数据
    }
    Api({ name, obj, suc, method })
  }
}

/**
 * [请求：删除文件]
 */
Prod.A_exportDelete = function () {
  const path = localStorage.getItem('NOVA_total_export_path') || ''
  if (path.length) {
    const name = '删除'
    const obj = { filePath: encodeURI(path) }
    const suc = function (res) {
      localStorage.removeItem('NOVA_total_export_path')
    }
    Api({ name, obj, suc })
  }
}

export default Prod
