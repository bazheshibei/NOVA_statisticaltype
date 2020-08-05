
const obj = {}

/** ----- getters ----- **/

/**
 * [表格数据]
 */
obj.tableData = function (state) {
  const that = this
  const { dataList, searchVal } = state
  // console.log('选中：大类 ----- ', searchVal)
  let list = []
  /* 循环：原始数据 */
  dataList.forEach(function (item, index) { // item: 单束原始数据：单条  index: 单束数据索引
    const arr = that.tableRow(item, searchVal, index) /** 表格：单束数据 **/
    arr[0].arrLength = arr.length
    list = list.concat(arr)
  })
  // console.log(' ----- 表格数据 ----- ', list)
  return list
}
/**
 * [表格：单束数据]
 * @param {[Object]} item [原始数据：单条]
 * @param {[Object]} data [选中：大类]
 * @param {[Int]}   index [原始数据：索引]
 */
obj.tableRow = function (item, data, index) {
  const { custom_dress_series_name, custom_name, dress_type_name, style_name } = item
  const fixedData = { custom_dress_series_name, custom_name, dress_type_name, style_name, index } // 每条的固定数据
  const otherData = {} //                                                                            抽取的数据
  const returnList = [] //                                                                           返回的数据
  for (const x in data) {
    const val = data[x] // 选中的大类： x = badorder_info, val = ['bad_bearer_type', 'bad_bearer_name']
    if (item[x] === null) {
      /* 不存在 */
    } else if (item[x].length) {
      /* 抽取数据：数组 */
      const list = this.forEachArr(item[x], val) /** 抽取数据：数组 **/
      list.forEach(function (val, key) {
        if (!returnList[key]) {
          returnList[key] = { key }
        }
        returnList[key] = Object.assign({}, returnList[key], fixedData, val)
      })
    } else {
      /* 抽取数据：对象 */
      val.forEach(function (str) {
        otherData[str] = item[x][str] || ''
      })
    }
  }
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
 * @param  {[Array]} attrArr   [原始数据：单条 -> 某一数组属性]
 * @param  {[Array]} selectArr [选中的大类 -> 某一下拉框的选项]
 * @return {[Array]} list      [原始数据中，符合下拉框选项的数据]
 */
obj.forEachArr = function (attrArr, selectArr) {
  const list = [] // 此数组属性中，符合下拉选项的数据
  attrArr.forEach(function (obj) {
    const data = {}
    let isPush = false // 是否 push
    selectArr.forEach(function (str) {
      data[str] = obj[str] || ''
      if (obj[str]) {
        isPush = true
      }
    })
    /* [原始数据：单条 -> 某一数组属性]  单条数据中全空则不录用 */
    if (isPush) {
      list.push(data)
    }
  })
  return list
}

/**
 * [删除线指标]
 * 跟此值相冲突的大类，标记删除线
 */
obj.deleteType = function (state) {
  const { selectArr, searchLabel } = state
  let deleteType = 'asd'
  for (const x in searchLabel) {
    if (searchLabel[x] && searchLabel[x].length) {
      for (let i = 0; i < selectArr.length; i++) {
        // 下拉框有此属性 && 下拉框的属性与大类属性名相匹配
        if (selectArr[i].word === x) {
          const id = selectArr[i].id
          if (id !== '402888f371ba89940171ba901d1b0000' && id !== '402888f371ba89940171ba91a3590001' && id !== '402888f371ba89940171ba91f1660002' && id !== '402888f371ba89940171ba94a9e80007') {
            deleteType = id // 记录第一个属性
            break
          }
        }
      }
    }
    if (deleteType !== 'asd') {
      break
    }
  }
  return deleteType
}

/**
 * [是否变化：大类]
 */
obj.changeSelect = function (state) {
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
obj.changeInput = function (state) {
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
obj.changeHeader = function (state) {
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
 * [整理数据：所勾选的大类]
 */
obj.exportSelect = function (data) {
  const obj = {}
  for (const x in data) {
    if (data[x].length) {
      /* 剔除空对象 */
      obj[x] = data[x]
    }
  }
  return obj
}

/**
 * [整理数据：全部大类 && 全部颜色]
 */
obj.nameColor = function (selectArr, colorArr) {
  const name = []
  selectArr.forEach(function (item) {
    name.push(item.word)
  })
  const color = []
  colorArr.forEach(function (item) {
    color.push(item.slice(1))
  })
  return { name, color }
}

/**
 * [是否选择：大类]
 */
obj.isChooseSelect = function (data) {
  const obj = this.exportSelect(data.exportSelect)
  if (Object.keys(obj).length) {
    return true
  } else {
    return false
  }
}

/**
 * [是否选择：大货相关 || 开发相关 || 设计相关]
 */
obj.isChoose3 = function (data) {
  const obj = this.exportSelect(data.exportSelect)
  let status = false
  for (const x in obj) {
    if (x === 'dh_relate' || x === 'kf_relate' || x === 'sj_relate' || x === 'customerorder_info') {
      status = true
      break
    }
  }
  return status
}

export default obj
