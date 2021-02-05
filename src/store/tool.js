
const Tool = {}

/**
 * [返回：整理后的指标数组]
 * @param  {[Array]}  res           原始指标数组
 * @param  {[Object]} selectNodeObj 上次勾选的指标
 * @return {[Array]}  arr           整理后的指标数组
 */
Tool.returnSelectArr = function (res = [], selectNodeObj = {}) {
  const selectArr = []
  const asdObj = {}
  res.forEach(function (data, index_1) {
    /* ----- 拆分大类：[大货相关、开发相关、设计相关、坏单信息......] ----- */
    const { type_name, type_code, statistical_type_id, sectypelist } = data // type_name: 大货相关、开发相关
    let num = 0
    if (type_code === 'dh_relate' || type_code === 'kf_relate' || type_code === 'sj_relate' || type_code === 'customerorder_info') {
      num = 1 // 用于合并表格行
    }
    const obj = { index_1, label: type_name, code: type_code, id: statistical_type_id, level: 1, columnKey: `${num}` }
    /* ----- 指标归类：[主要指标、二级指标、三级指标、其他......] ----- */
    const targetObj = {}
    const targetArr = []
    sectypelist.forEach(function (item, index_2) {
      const { typename, statistical_indicator_type_id, indicatorlist } = item // typename: 主要指标、二级指标
      if (typeof targetObj[typename || '其他'] !== 'number') {
        targetObj[typename || '其他'] = targetArr.length
        targetArr[targetArr.length] = { index_1, index_2, label: typename || '其他', id: statistical_indicator_type_id, level: 2, children: [] }
      }
      /* ----- 提取点选的指标：[项目名称、项目类型、项目季节、报价成本......] ----- */
      indicatorlist.forEach(function (val, index_3) {
        val.label = val.indicator_name // label: 项目名称、项目类型
        val.label_p = type_name
        val.code = val.indicator_code
        val.code_p = type_code
        val.id = val.statistical_indicator_id
        val.id_p = statistical_type_id
        val.status = false
        val.level = 3
        val.index_1 = index_1
        val.index_2 = index_2
        val.index_3 = index_3
        val.columnKey = `${num}`
        /* 检查上次是否勾选过 */
        const data = selectNodeObj[index_1] || {}
        if (Object.keys(data).length) {
          for (const x in data) {
            const [num_1, num_2] = x.split('-')
            if (String(num_1) === String(index_2)) {
              if (String(num_2) === String(index_3)) {
                val.status = true
              }
            }
          }
        }
        /* 记录：是否合并 */
        if (String(val.secondtype) === '1') {
          asdObj[val.indicator_code] = true
        }
        /* 添加数据 */
        targetArr[targetObj[typename || '其他']].children.push(val)
      })
    })
    obj.children = targetArr
    selectArr.push(obj)
  })
  // console.log('整理后的指标数组 ----- ', selectArr)
  return { selectArr, asdObj }
}

/**
 * [提取：选中的数据]
 * @param  {[Object]} selectNodeObj select 选中的节点对象
 * @return {[Object]} {}            排序后的数据, 选中：大类, 选中：表头名称
 */
Tool.returnSearchData = function (selectNodeObj) {
  const searchData = {} //  选中的数据 { 0: [{}] } ==> { 大类索引: [二级指标1对象1， 二级指标1对象2， 二级指标2对象1] }
  const searchVal = {} //   选中：大类 { dh_relate: ['dh_item_name'] }
  const searchLabel = {} // 选中：表头名称 { dh_relate: ['项目名称'] }
  for (const x in selectNodeObj) {
    for (const y in selectNodeObj[x]) {
      /* 提取：选中的数据 */
      if (!searchData[selectNodeObj[x][y].index_1]) {
        searchData[selectNodeObj[x][y].index_1] = []
      }
      searchData[selectNodeObj[x][y].index_1].push(selectNodeObj[x][y])
      /* 提取：选中：大类 */
      if (!searchVal[selectNodeObj[x][y].code_p]) {
        searchVal[selectNodeObj[x][y].code_p] = []
      }
      searchVal[selectNodeObj[x][y].code_p].push(selectNodeObj[x][y].code)
      /* 提取：选中：表头名称 */
      if (!searchLabel[selectNodeObj[x][y].code_p]) {
        searchLabel[selectNodeObj[x][y].code_p] = []
      }
      searchLabel[selectNodeObj[x][y].code_p].push(selectNodeObj[x][y].label)
    }
  }
  return Object.assign({}, { searchData, searchVal, searchLabel })
}

/**
 * [重置：指标勾选状态]
 * @param  {[Array]} selectArr 整理后的指标数组
 * @return {[Array]} selectArr 取消勾选的指标数组
 */
Tool.resetSelectArr = function (selectArr) {
  selectArr.map(item => {
    if (item.children && item.children.length) {
      item.children.map(val => {
        if (val.children && val.children.length) {
          val.children.map(node => {
            node.status = false
          })
        }
      })
    }
  })
  return selectArr
}

/**
 * [整理数据：选中的大类]
 */
Tool.columncondition = function (data) {
  const obj = {}
  for (const x in data) {
    const arr = data[x] || []
    arr.forEach((item) => {
      const { code_p, code, label } = item
      if (!obj[code_p]) {
        obj[code_p] = []
      }
      obj[code_p].push({ statistics_field_name: code, statistics_remark: label })
    })
  }
  return obj
}

/**
 * [整理数据：全部大类 && 全部颜色]
 */
Tool.nameColor = function (selectArr = [], colorArr = []) {
  const name = []
  selectArr.forEach((item) => {
    name.push(item.code)
  })
  const color = []
  colorArr.forEach((item) => {
    color.push(item.slice(1))
  })
  return { name, color }
}

/** ----- getters ----- **/

/**
 * [表格数据]
 */
Tool._tableData = function (state) {
  const that = this
  const { dataList = [], searchVal } = state
  let list = []
  /* 循环：原始数据 */
  // console.log('dataList ----- ', dataList)
  dataList.forEach(function (item, index) { // item: 单束原始数据：单条  index: 单束数据索引
    const arr = that._tableRow(item, searchVal, index) /** 表格：单束数据 **/
    arr[0].arrLength = arr.length
    list = list.concat(arr)
  })
  return list
}

/**
 * [表格：单束数据]
 * @param {[Object]} item [原始数据：单条]
 * @param {[Object]} data [选中：大类]
 * @param {[Int]}   index [原始数据：索引]
 */
Tool._tableRow = function (item, data, index) {
  const { custom_dress_series_name, custom_name, mr_dh_item_name, dress_type_name, style_name } = item
  const fixedData = { custom_dress_series_name, custom_name, mr_dh_item_name, dress_type_name, style_name, index } // 每条的固定数据
  const otherData = {} //                                                                                             抽取的数据
  const returnList = [] //                                                                                            返回的数据
  for (const x in data) {
    const val = data[x] || [] // 选中的大类： x = badorder_info, val = ['bad_bearer_type', 'bad_bearer_name']
    let objOrArr = item[x] //    数据中的大类对象或数组
    if (x === 'purchasedeliver_info' || x === 'purchaseorder_info') {
      objOrArr = item['material_info'] || [] // purchasedeliver_info 和 purchaseorder_info 用 material_info 的数据
    }
    if (objOrArr === null || !objOrArr) {
      /* 不存在 */
    } else if (objOrArr.length) {
      /* 抽取数据：数组（其他大类） */
      const list = this._forEachArr(objOrArr, val, x) /** 抽取数据：数组 **/
      list.forEach(function (val, key) {
        if (!returnList[key]) {
          returnList[key] = { key }
        }
        returnList[key] = Object.assign({}, returnList[key], fixedData, val)
      })
    } else {
      /* 抽取数据：对象（大货、开发、设计相关） */
      val.forEach(function (str) {
        otherData[str] = objOrArr[str] !== null ? objOrArr[str] : ''
      })
    }
  }
  // console.log('returnList ----- ', returnList)
  /* ----- 导出 ----- */
  if (Object.keys(otherData).length) {
    /* 抽取的数据：有 (抽取数据：对象) */
    if (returnList.length) {
      const list = []
      returnList.forEach(function (val, key) {
        list.push(Object.assign({}, val, { key }, otherData))
      })
      return list
    } else {
      return [Object.assign({}, otherData, fixedData)]
    }
  } else if (returnList.length) {
    /* 抽取数据：数组 */
    return returnList
  } else {
    /* 抽取的数据：无 */
    return [fixedData]
  }
}

/**
 * [抽取数据：数组]
 * @param  {[Array]}  attrArr   [原始数据：单条 -> 某一数组属性]
 * @param  {[Array]}  selectArr [选中的大类 -> 某一下拉框的选项]
 * @param  {[String]} code_p    [大类code] purchasedeliver_info、purchaseorder_info、material_info 匹配不到导出空对象
 * @return {[Array]} list      [原始数据中，符合下拉框选项的数据]
 */
Tool._forEachArr = function (attrArr, selectArr, code_p) {
  const list = [] //  此数组属性中，符合下拉选项的数据
  if (code_p === 'material_info' || code_p === 'purchaseorder_info' || code_p === 'purchasedeliver_info') {
    /* ----- 相关联的三个大类： 物料分析相关 || 采购跟进相关 || 大货验货相关 ----- */
    let asd_id = ''
    let asd_num = 1
    let asd_index = 0
    attrArr.forEach(function (obj, index) {
      const data = {}
      selectArr.forEach(function (str) {
        data[str] = obj[str] !== null ? obj[str] : ''
      })
      list.push(data)
      /* ----- 统计合并 ----- */
      const countObj = {
        material_info: {
          name_1: 'mi_system_material_statistics_id',
          name_2: 'asd_mi'
        },
        purchaseorder_info: {
          name_1: 'puro_purchase_order_detail_id',
          name_2: 'asd_puro'
        }
      }
      const { name_1 = '', name_2 = '' } = countObj[code_p] || {}
      if (name_1) {
        if (asd_id && asd_id !== obj[name_1]) {
          /* ----- 遇到新的ID ----- */
          /* 记录上一模块的合并数据 */
          list[asd_index][name_2] = asd_num // 添加合并记录
          if (obj[name_1]) {
            /* 当前行__有值：重新计算合并 */
            asd_id = obj[name_1] // 重新记录：值
            asd_num = 1 //          重新记录：合并行数
            asd_index = index //    重新记录：合并起始行索引
          } else {
            /* 当前行__没值：记录当前模块合并数据 && 重新计算合并 */
            list[index][name_2] = 1 // 添加合并记录
            asd_id = '' //             重新记录：值
            asd_num = 1 //             重新记录：合并行数
            asd_index = index + 1 //   重新记录：合并起始行索引
          }
        } else if (asd_id && asd_id === obj[name_1]) {
          /* ----- 相同ID，合并记录+1 ----- */
          asd_num += 1
        } else if (!asd_id) {
          /* ----- asd_id === ''时 ----- */
          if (obj[name_1]) {
            /* 当前行__有值：记录当前的 值 和 index */
            asd_id = obj[name_1] // 记录：值
            asd_index = index //    记录：合并起始行索引
          } else {
            // 当前行__没值：记录当前模块合并数据
            list[index][name_2] = 1 // 添加合并记录
            asd_id = '' //             重新记录：合并行数
            asd_num = 1 //             重新记录：合并行数
          }
        }
        if (index === attrArr.length - 1) {
          /* 添加合并记录 */
          list[index][name_2] = asd_num
        }
      }
      // if (code_p === 'material_info') {
      //   if (asd_id && asd_id !== obj.mi_system_material_statistics_id) { //       遇到新的ID
      //     /* 添加合并记录 */
      //     list[asd_index].asd_num = asd_num
      //     /* 重置 */
      //     asd_id = obj.mi_system_material_statistics_id
      //     asd_num = 1
      //     asd_index = index
      //   } else if (asd_id && asd_id === obj.mi_system_material_statistics_id) { // 相同ID，合并记录+1
      //     asd_num += 1
      //   } else if (!asd_id) { //                                                   记录第一条的ID和index
      //     asd_id = obj.mi_system_material_statistics_id
      //     asd_index = index
      //   }
      //   if (index === attrArr.length - 1) {
      //     /* 添加合并记录 */
      //     list[asd_index].asd_num = asd_num
      //   }
      // }
    })
  } else {
    /* ----- 其他大类 ----- */
    attrArr.forEach(function (obj) {
      const data = {}
      let isPush = false // 是否 push
      selectArr.forEach(function (str) {
        data[str] = obj[str] !== null ? obj[str] : ''
        if (obj[str] !== null) {
          isPush = true
        }
      })
      /* [原始数据：单条 -> 某一数组属性]  单条数据中全空则不录用 */
      if (isPush) {
        list.push(data)
      }
    })
  }
  return list
}

/**
 * [删除线指标]
 * 跟此值相冲突的大类，标记删除线
 */
Tool._deleteType = function (state) {
  const { searchData = {} } = state // select 选中的指标数据
  let deleteType = ''
  for (const x in searchData) {
    const arr = searchData[x] || [] // 所选的某一大类 [{指标对象1}, {指标对象2}]
    if (arr.length) {
      const { id_p: id } = arr[0] //                               大类的ID
      const prove_1 = id !== '402888f371ba89940171ba901d1b0000' // 大货相关
      const prove_2 = id !== '402888f371ba89940171ba91a3590001' // 开发相关
      const prove_3 = id !== '402888f371ba89940171ba91f1660002' // 设计相关
      const prove_4 = id !== '402888f371ba89940171ba94a9e80007' // 客户订单相关
      if (prove_1 && prove_2 && prove_3 && prove_4) {
        deleteType = id // 记录第一个ID
        break
      }
    }
  }
  return deleteType
}

/**
 * [是否变化：大类]
 */
Tool._changeSelect = function (state) {
  let selectStatus = false
  const { searchVal, lastSearchVal } = state
  const arr = []
  const last = []
  for (const x in searchVal) {
    if (searchVal[x] && searchVal[x].length) {
      arr.push(x)
    }
  }
  for (const x in lastSearchVal) {
    if (lastSearchVal[x] && lastSearchVal[x].length) {
      last.push(x)
    }
  }
  const str = arr.sort().join(',') // 将有值的下拉框的属性名拼成字符串
  const lastStr = last.sort().join(',') // 将有值的下拉框的属性名拼成字符串
  if (str !== lastStr) {
    selectStatus = true // 此时选中大类字符串 vs 上次搜索时大类字符串
  }
  return selectStatus
}

/**
 * [是否变化：input]
 */
Tool._changeInput = function (state) {
  let inputStatus = false
  const { searchText, lastSearchText } = state
  if (searchText !== lastSearchText) {
    inputStatus = true // 此时input值 vs 上次搜索时input值
  }
  return inputStatus
}

/**
 * [是否变化：表头]
 */
Tool._changeHeader = function (state) {
  let headerStatus = false
  const { searchHeader } = state
  for (const x in searchHeader) {
    if (searchHeader[x]) {
      headerStatus = true
      break
    }
  }
  return headerStatus
}

/**
 * [是否选择：大类]
 */
Tool._isChooseSelect = function (state) {
  const { searchData = {} } = state // select 选中的指标数据
  let status = false
  for (const x in searchData) {
    const arr = searchData[x] || [] // 所选的某一大类 [{指标对象1}, {指标对象2}]
    if (arr.length) {
      status = true
      break
    }
  }
  return status
}

/**
 * [是否选了：大货相关 || 开发相关 || 设计相关]
 */
Tool._isChoose3 = function (state) {
  const { searchData = {} } = state // select 选中的指标数据
  let status = false
  for (const x in searchData) {
    const arr = searchData[x] || [] // 所选的某一大类 [{指标对象1}, {指标对象2}]
    if (arr.length) {
      const { code_p } = arr[0] //                       大类的code
      const prove_1 = code_p === 'dh_relate' //          大货相关
      const prove_2 = code_p === 'kf_relate' //          开发相关
      const prove_3 = code_p === 'sj_relate' //          设计相关
      const prove_4 = code_p === 'customerorder_info' // 客户订单相关
      if (prove_1 || prove_2 || prove_3 || prove_4) {
        status = true
        break
      }
    }
  }
  return status
}

export default Tool
